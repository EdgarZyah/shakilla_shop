// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { receiptUpload } = require('../config/multerConfig');

// USER ROUTES
router.post('/checkout', authenticate, orderController.checkout);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderDetail);

// --- PERBAIKAN: Hapus 'isAdmin' dari rute ini ---
// Pengguna biasa perlu mengakses ini untuk "membatalkan"
router.put('/:id/status', authenticate, orderController.updateOrderStatus);
// --- AKHIR PERBAIKAN ---

// ADMIN ROUTES
router.put(
  '/:id/ship',
  authenticate,
  isAdmin,
  receiptUpload,
  orderController.shipOrder
);

module.exports = router;