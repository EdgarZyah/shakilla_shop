// server/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// PUBLIC/USER ROUTES
// GET /api/categories - Ambil semua kategori
router.get('/', categoryController.getAllCategories);

// ADMIN ROUTES (Dilindungi oleh authenticate dan isAdmin)
// POST /api/categories - Buat kategori baru
router.post('/', authenticate, isAdmin, categoryController.createCategory);

// PUT /api/categories/:id - Update kategori
router.put('/:id', authenticate, isAdmin, categoryController.updateCategory);

// DELETE /api/categories/:id - Hapus kategori
router.delete('/:id', authenticate, isAdmin, categoryController.deleteCategory);

module.exports = router;