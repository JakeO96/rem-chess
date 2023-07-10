import {authRouter as authRoutes} from './routes/authRoutes';
import {userRouter as userRoutes} from './routes/userRoutes';
import {gameRouter as gameRoutes} from './routes/gameRoutes';

import express from "express"
import { errorHandler } from "./middleware/errorHandler"
import { connectDb } from "./config/dbConnection"
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv-safe';
dotenv.config();

connectDb();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(errorHandler);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/game", gameRoutes);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})