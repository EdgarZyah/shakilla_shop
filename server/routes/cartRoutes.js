const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/auth');

// Semua rute ini memerlukan otentikasi pengguna
router.use(authenticate);

// GET /api/cart - Ambil isi keranjang
router.get('/', cartController.getCart);

// POST /api/cart - Tambah/Update item ke keranjang
router.post('/', cartController.addToCart);

// FIX: PUT /api/cart/item/:itemId - Update kuantitas item
router.put('/item/:itemId', cartController.updateCartItemQuantity);

// DELETE /api/cart/item/:itemId - Hapus satu item dari keranjang
router.delete('/item/:itemId', cartController.removeItemFromCart);

// DELETE /api/cart/clear - Hapus seluruh isi keranjang
router.delete('/clear', cartController.clearCart);

module.exports = router;