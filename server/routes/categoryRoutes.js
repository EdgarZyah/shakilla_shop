const express = require("express");
const Category = require("../models/category");
const router = express.Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Nama kategori wajib diisi." });
    }

    const newCategory = await Category.create({ name });
    res.status(201).json({ message: "Kategori berhasil dibuat!", category: newCategory });
  } catch (err) {
    res.status(500).json({ message: "Gagal membuat kategori", error: err.message });
  }
});

module.exports = router;