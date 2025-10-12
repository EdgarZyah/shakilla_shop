const express = require('express');
const router = express.Router();
const { paymentUpload } = require('../config/multerConfig');
const paymentController = require('../controllers/paymentController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// USER ROUTE
router.post('/upload', authenticate, paymentUpload, paymentController.uploadPaymentProof);

// ADMIN ROUTES
router.get('/pending', authenticate, isAdmin, paymentController.getPendingPayments);
router.put('/:id/verify', authenticate, isAdmin, paymentController.verifyPayment);

module.exports = router;
