import mongoose from "mongoose";
import { Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "add email"],
    },
    username: {
      type: String,
      required: [true, "add username"],
    },
    password: {
      type: String,
      required: [true, "add password"]
    }
  }, 
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);
