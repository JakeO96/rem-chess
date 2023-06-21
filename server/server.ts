import express from "express";
const dotenv = require("dotenv").config();

const app = express();
const port = process.env.PORT

app.use("/api/auth", require("./routes/authRoutes"))

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});