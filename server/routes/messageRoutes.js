const express = require("express");
const Message = require("../models/message");
const router = express.Router();

router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.findAll();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
});

module.exports = router;
