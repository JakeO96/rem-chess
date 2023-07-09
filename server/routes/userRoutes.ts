import express from "express";
import { getAllUsers, getUser, emailExists, usernameExists, updateUser, deleteUser } from "../controllers/userController";

const userRouter = express.Router();
userRouter.route("/").get(getAllUsers);
userRouter.route("/:id").get(getUser);
userRouter.route("/email-exists").post(emailExists);
userRouter.route("/username-exists").post(usernameExists);
userRouter.route("/:id").put(updateUser);
userRouter.route("/:id").delete(deleteUser);

module.exports = userRouter;