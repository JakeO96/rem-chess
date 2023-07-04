import express from "express";

const { getAllUsers, getUser, updateUser, deleteUser } = require("../controllers/userController")
const userRouter = express.Router();

userRouter.route("/").get(getAllUsers);

userRouter.route("/:id").get(getUser);

userRouter.route("/:id").put(updateUser);

userRouter.route("/:id").delete(deleteUser);

module.exports = userRouter;