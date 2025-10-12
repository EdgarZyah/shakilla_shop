// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// POST /api/auth/signup - Pendaftaran pengguna baru
router.post('/signup', authController.register); // <-- Diubah dari /register menjadi /signup

// POST /api/auth/login - Login pengguna
router.post('/login', authController.login);

// GET /api/auth/profile - Ambil data profile dari token (Keep Alive)
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;