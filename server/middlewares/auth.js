// server/middlewares/auth.js
const jwt = require('jsonwebtoken');
const db = require('../models/index'); // <-- PERUBAHAN DI SINI
const { User } = db;

// Middleware untuk memverifikasi JWT dan menambahkan user ke request
exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Ambil Bearer token
        if (!token) {
            return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Cari user di database
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] } // Jangan kirim password
        });

        if (!user) {
            return res.status(401).json({ message: 'Token tidak valid. Pengguna tidak ditemukan.' });
        }

        req.user = user; // Tambahkan objek user ke request
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token tidak valid.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token kedaluwarsa.' });
        }
        res.status(500).json({ message: 'Kesalahan otentikasi server.' });
    }
};

// Middleware untuk membatasi akses ke admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Akses terlarang. Diperlukan peran Admin.' });
    }
};

// Middleware untuk membatasi akses ke user biasa (bukan admin)
exports.isUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(403).json({ message: 'Akses terlarang. Diperlukan peran User.' });
    }
};