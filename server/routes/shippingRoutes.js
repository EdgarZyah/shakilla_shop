const express = require("express");
const Shipping = require("../models/shipping");
const router = express.Router();

router.get("/shipping", async (req, res) => {
  try {
    const shippings = await Shipping.findAll();
    res.json(shippings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching shipping data", error: err.message });
  }
});

module.exports = router;
