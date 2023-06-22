import express from "express";
const cors = require('cors');
const dotenv = require("dotenv").config();

const app = express();
const port = process.env.PORT

app.use(cors({ origin: 'http://localhost:3000' }));
app.use("/api/auth", require("./routes/authRoutes"))

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});