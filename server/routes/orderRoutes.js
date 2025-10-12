// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// USER ROUTES
// POST /api/orders/checkout - Melakukan checkout dari cart
router.post('/checkout', authenticate, orderController.checkout);

// GET /api/orders - Mendapatkan daftar order (User: miliknya, Admin: semua/filter)
// FIX: HANYA PERLU authenticate, logika filter ada di controller
router.get('/', authenticate, orderController.getOrders);

// GET /api/orders/:id - Mendapatkan detail order
router.get('/:id', authenticate, orderController.getOrderDetail);

// ADMIN ROUTES
// PUT /api/orders/:id/status - Mengubah status order (Admin Only)
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);

module.exports = router;