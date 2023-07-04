import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { connectDb } from "./config/dbConnection"
const cors = require('cors');
const dotenv = require("dotenv").config();

connectDb();
const app = express();
const port = process.env.PORT

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/user", require("./routes/userRoutes"))
app.use(errorHandler)

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});