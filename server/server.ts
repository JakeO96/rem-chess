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
import { info } from 'console';
dotenv.config();

interface ExtendedIncomingMessage extends IncomingMessage {
  user?: { 
    username?: string; 
  };
}

interface ExtendedWebSocket extends WebSocket {
  username?: string;
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
    const secret = process.env.JWT_SECRET;
    if (token && secret) {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          callback(false);
        } else {
          if (decoded && typeof decoded !== 'string') {
            (info.req as ExtendedIncomingMessage).user = { username: decoded.user.username };
            callback(true);
          }
        }
      });
    }
  } 
});

const activeConnections: ActiveConnections = {};

wss.on('connection', (ws: ExtendedWebSocket, req: ExtendedIncomingMessage) => {
  if (req.user && req.user.username) {
    ws.username = req.user.username;
    activeConnections[ws.username] = ws;
  }
  // When a new connection is made, send a message to the client
  ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));

  ws.on('message', (message) => {
    const messageStr = typeof message === 'string' ? message : message.toString();
    const data = JSON.parse(messageStr);
    if (data.type === 'game-invite') {
      const recievingUserWs = activeConnections[data.recievingUser];
      if (recievingUserWs) {
        recievingUserWs.send(message);
      }
    } else if (data.type === 'game-invite-response') {
      if (ws.username) {
        const initiatingUserWs = activeConnections[data.recievingUser];
        if (initiatingUserWs) {
          if (data.accepted) {
            const recievingUserWs = activeConnections[data.initiatingUser];
            if (recievingUserWs) {
              if (initiatingUserWs.readyState === WebSocket.OPEN || recievingUserWs.readyState === WebSocket.OPEN) {
                data.type = 'game-start';
                const newMessage = JSON.stringify(data);

                initiatingUserWs.send(newMessage);
                recievingUserWs.send(newMessage);
              } else {
                data.type = 'game-decline'
                const newMessage = JSON.stringify(data);
                recievingUserWs.send(newMessage);
              }
            }
          } 
        }
      }
    }
  });

  ws.on('close', () => {
    if (ws.username) {
      delete activeConnections[ws.username];
    }
  });
});
