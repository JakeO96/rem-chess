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

interface ActiveGames {
  [key: string]: string[];
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

let activeConnections: ActiveConnections = {};
let activeGames: ActiveGames  = {};

wss.on('connection', (ws: ExtendedWebSocket, req: ExtendedIncomingMessage) => {
  if (req.user && req.user.username) {
    ws.username = req.user.username;
    activeConnections[ws.username] = ws;
  }

  ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));

  ws.on('message', (message) => {
    const messageStr = typeof message === 'string' ? message : message.toString();
    const data = JSON.parse(messageStr);
    if (data.type === 'game-invite') {
      const recievingUserWs = activeConnections[data.recievingUser];
      if (recievingUserWs) {
        if (recievingUserWs.readyState === WebSocket.OPEN) {
          recievingUserWs.send(message);
        }
      }
    } else if (data.type === 'game-invite-response') {
      if (ws.username) {
        const initiatingUserWs = activeConnections[data.recievingUser];
        if (initiatingUserWs) {
          const recievingUserWs = activeConnections[data.initiatingUser];
          if (recievingUserWs) {
            if (data.accepted) {
              if (initiatingUserWs.readyState === WebSocket.OPEN || recievingUserWs.readyState === WebSocket.OPEN) {
                data.type = 'create-game';
                const newMessage = JSON.stringify(data);
                recievingUserWs.send(newMessage);
              }
            } else {
              if (recievingUserWs.readyState === WebSocket.OPEN) {
                data.type = 'game-decline';
                const newMessage = JSON.stringify(data);
                recievingUserWs.send(newMessage);
              }
            }
          }
        }
      } else {
        console.log('failed at ws.username check');
      }
    } else if (data.type === 'game-created') {
      if (ws.username) {
        activeGames[data.gameId] = [data.recievingUser, data.initiatingUser];
        const initiatingUserWs = activeConnections[data.recievingUser];
        const recievingUserWs = activeConnections[data.initiatingUser];
        if (initiatingUserWs && recievingUserWs) {
          data.type = 'start-game'
          const newMessage = JSON.stringify(data);
          initiatingUserWs.send(newMessage);
          recievingUserWs.send(newMessage);
        }
      }     
    } else if (data.type === 'valid-move') {
      if (ws.username) {
        if (activeGames[data.gameId]) {
          const [recievingUser, initiatingUser] = activeGames[data.gameId];
          if (data.player === recievingUser) {
            const newMessage = JSON.stringify({type: 'move-made', newGameState: data.newGameState})
            const initiatingUserWs = activeConnections[initiatingUser];
            initiatingUserWs.send(newMessage);
          } else {
            const newMessage = JSON.stringify({type: 'move-made', newGameState: data.newGameState})
            const recievingUserWs = activeConnections[recievingUser];
            recievingUserWs.send(newMessage);
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
