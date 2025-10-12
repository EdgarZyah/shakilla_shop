// server/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// USER ROUTES (Memerlukan Otentikasi)

// POST /api/messages - Mengirim pesan (Kontak Kami)
router.post('/', authenticate, messageController.createMessage);


// ADMIN ROUTES (Memerlukan Otentikasi + Admin Role)

// GET /api/messages - Ambil semua pesan
router.get('/', authenticate, isAdmin, messageController.getAllMessages);

// DELETE /api/messages/:id - Hapus pesan
router.delete('/:id', authenticate, isAdmin, messageController.deleteMessage);

module.exports = router;