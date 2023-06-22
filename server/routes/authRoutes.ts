import express from "express";

const router = express.Router();

router.route("/").get((req, res) => {
  res.status(200).json({ working: true });
});

module.exports = router; 