const express = require("express");
const Payment = require("../models/payment");
const router = express.Router();

router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments", error: err.message });
  }
});

module.exports = router;
