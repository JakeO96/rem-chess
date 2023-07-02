import express from "express";

const { checkUsername, getUser, updateUser, deleteUser } = require("../controllers/userController")
const userServicesRouter = express.Router();

userServicesRouter.route("/does-username-exist:id").post(checkUsername);

userServicesRouter.route("/:id").get(getUser);

userServicesRouter.route("/update-user:id").put(updateUser);

userServicesRouter.route("/delete-user:id").delete(deleteUser);

module.exports = userServicesRouter; 