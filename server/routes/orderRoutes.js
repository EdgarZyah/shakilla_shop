// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { receiptUpload } = require('../config/multerConfig');

// --- Rute GET & POST Utama ---
router.post('/checkout', authenticate, orderController.checkout);
router.get('/', authenticate, orderController.getOrders);

// --- [INI DIA PERBAIKANNYA] ---
// Rute EXPORT harus ditambahkan di sini (SEBELUM /:id)
// Inilah yang menyebabkan error 404 Anda
router.get(
  '/export/excel',
  authenticate,
  isAdmin, // Pastikan hanya admin
  orderController.exportOrdersToExcel
);
// --- [AKHIR PERBAIKAN] ---


// USER ROUTES
router.get('/:id', authenticate, orderController.getOrderDetail);

router.put(
  '/:id/status', 
  authenticate, 
  orderController.updateOrderStatus
);

// ADMIN ROUTES
router.put(
  '/:id/ship',
  authenticate,
  isAdmin,
  receiptUpload,
  orderController.shipOrder
);

module.exports = router;