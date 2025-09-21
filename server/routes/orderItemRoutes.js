const express = require("express");
const OrderItem = require("../models/orderItem");
const router = express.Router();

router.get("/order_items", async (req, res) => {
  try {
    const items = await OrderItem.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching order items", error: err.message });
  }
});

module.exports = router;
