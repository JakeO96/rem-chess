import mongoose from "mongoose";
import { Document } from "mongoose";

export interface IGame extends Document {
  player_id: string;
  opponent_id: string;
  moves: Array<object>;
}

const gameSchema = new mongoose.Schema(
  {
    player_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true],
      ref: "User",
    },
    opponent_id: {
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