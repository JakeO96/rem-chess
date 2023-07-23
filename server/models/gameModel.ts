import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";

export interface IMove {
  whiteMove: string;
  blackMove: string;
}

export interface IGame extends Document {
  playerId: Schema.Types.ObjectId;
  opponentId: Schema.Types.ObjectId;
  moves: IMove[];
}


const gameSchema = new mongoose.Schema(
  {
    heroId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true],
      ref: "User",
    },
    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true],
      ref: "User",
    },
    moves: {
      type: Object,
      required: [true],
    },
  }, 
  {
    timestamps: true,
  }
);

export default mongoose.model<IGame>('Game', gameSchema);