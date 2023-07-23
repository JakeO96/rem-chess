import {authRouter as authRoutes} from './routes/authRoutes';
import {userRouter as userRoutes} from './routes/userRoutes';
import {gameRouter as gameRoutes} from './routes/gameRoutes';
import { errorHandler } from "./middleware/errorHandler"
import { connectDb } from "./config/dbConnection"
import express from "express"
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import WebSocket from 'ws';
import http, { IncomingMessage} from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv-safe';
dotenv.config();

interface ExtendedIncomingMessage extends IncomingMessage {
  user?: { 
    id?: string; 
  };
}

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
}

interface ActiveConnections {
  [key: string]: ExtendedWebSocket;
}

connectDb();
const app = express();
const port = process.env.PORT || 3001;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/game", gameRoutes);
app.use(errorHandler);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
})

const wss = new WebSocket.Server({ 
  server, 
  verifyClient: (info, callback) => {
    const cookieString = info.req.headers.cookie || "";
    const cookies = cookieString.split('; ').reduce((acc, current) => {
      const [name, value] = current.split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies.token;
    console.log('during ws creation jwt token is:')
    console.log(token)
    const secret = process.env.JWT_SECRET;
    console.log('during ws creation jwt secret is:')
    console.log(secret)
    if (token && secret) {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          callback(false);
        } else {
          if (decoded && typeof decoded !== 'string') {
            console.log(decoded.user.id);
            (info.req as ExtendedIncomingMessage).user = { id: decoded.user.id };
            callback(true);
          }
        }
      });
    }
  } 
});

const activeConnections: ActiveConnections = {};

wss.on('connection', (ws: ExtendedWebSocket, req: ExtendedIncomingMessage) => {
  if (req.user && req.user.id) {
    ws.userId = req.user.id;
    activeConnections[ws.userId] = ws;
  }
  // When a new connection is made, send a message to the client
  ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));

  ws.on('message', (message) => {
    const messageStr = typeof message === 'string' ? message : message.toString();
    const data = JSON.parse(messageStr);
    if (data.type === 'game-invite') {
      const invitedUserWs = activeConnections[data.invitedUserId];
      if (invitedUserWs) {
        invitedUserWs.send(message);
      }
    } else if (data.type === 'game-invite-response') {
      const inviterUserWs = activeConnections[data.inviterUserId];
      if (inviterUserWs) {
        inviterUserWs.send(message);
      }
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      delete activeConnections[ws.userId];
    }
  });
});
