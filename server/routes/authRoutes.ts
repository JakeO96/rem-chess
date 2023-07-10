import express from "express"
import { validateToken } from "../middleware/validateTokenHandler"
import { createUser, login } from "../controllers/authController";

const authRouter = express.Router();

authRouter.route("/register").post(createUser);
authRouter.route("/login").post(login);

export { authRouter }