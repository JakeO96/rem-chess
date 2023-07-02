import express from "express";

const { createUser } = require("../controllers/authController")
const authRouter = express.Router();

authRouter.route("/create-user").post(createUser);

module.exports = authRouter; 