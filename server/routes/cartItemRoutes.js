const express = require("express");
const CartItem = require("../models/cartItem");
const router = express.Router();

router.get("/cart_items", async (req, res) => {
  try {
    const items = await CartItem.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart items", error: err.message });
  }
});

module.exports = router;
