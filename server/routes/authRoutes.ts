import express from "express";

const router = express.Router();

router.route("/").get((req, res) => {
  res.status(200).json({ username: "see if username exists" });
});

module.exports = router; 