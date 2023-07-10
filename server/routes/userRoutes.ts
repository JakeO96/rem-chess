import express from "express";
import { getAllUsers, getUser, fieldExists, updateUser, deleteUser, currentUser } from "../controllers/userController";
import { validateToken } from "../middleware/validateTokenHandler";

const userRouter = express.Router();
userRouter.route("/").get(getAllUsers);
userRouter.route("/exists/:fieldName/:value").get(fieldExists);
userRouter.route("/:id").get(getUser);
userRouter.route("/:id").put(updateUser);
userRouter.route("/:id").delete(deleteUser);
userRouter.get("/current-user", validateToken, currentUser);

export {userRouter}