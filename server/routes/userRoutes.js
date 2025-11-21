// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// USER ROUTES (Memerlukan Otentikasi)
router.use(authenticate);

// GET /api/users/profile - Ambil data profil sendiri
router.get('/profile', userController.getProfile);

// PUT /api/users/profile - Update data profil sendiri (general fields)
router.put('/profile', userController.updateProfile);

// FIX: Endpoint khusus untuk ganti password sendiri
router.put('/profile/password', userController.updateUserPassword);


// ADMIN ROUTES
router.get('/dashboard/stats', isAdmin, userController.getDashboardStats);

// GET /api/users - Ambil semua pengguna
router.get('/', isAdmin, userController.getAllUsers);

// GET /api/users/:id - Ambil detail pengguna
router.get('/:id', isAdmin, userController.getUserDetail);

// PUT /api/users/:id/role - Update peran pengguna (Admin only, for other users)
router.put('/:id/role', isAdmin, userController.updateUserRole);

// DELETE /api/users/:id - Hapus pengguna
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;