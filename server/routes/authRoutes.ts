import express from "express"
import { validateToken } from "../middleware/validateTokenHandler"

const { createUser, login, currentUser } = require("../controllers/authController");
const authRouter = express.Router();

authRouter.route("/create-user").post(createUser);
authRouter.route("/login").post(login);
authRouter.get("/current-user", validateToken, currentUser);

module.exports = authRouter; 