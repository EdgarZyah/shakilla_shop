const express = require("express");
const User = require("../models/user");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const { Op } = require("sequelize"); // Tambahkan Op untuk validasi

// Middleware untuk otentikasi sederhana
const authenticateUser = (req, res, next) => {
    const userId = req.cookies.userId;
    if (!userId) {
        return res.status(401).json({ message: "Akses ditolak. Tidak ada user yang terautentikasi." });
    }
    req.userId = userId;
    next();
};

// Mendapatkan semua pengguna
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// Mendapatkan satu pengguna berdasarkan ID
router.get("/users/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.params.id;
    if (parseInt(req.userId) !== parseInt(userId) && req.cookies.userRole !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak. Anda tidak berhak melihat data pengguna ini." });
    }
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] } // Jangan kirim password
    });
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

// Endpoint baru untuk mengubah data profil pengguna
router.put(
  "/users/:id",
  authenticateUser,
  [
    body('email')
      .isEmail().withMessage('Email tidak valid')
      .normalizeEmail(),
    body('first_name').trim().notEmpty().withMessage('Nama depan wajib'),
    body('last_name').trim().notEmpty().withMessage('Nama belakang wajib'),
    body('username').trim().notEmpty().withMessage('Username wajib'),
    body('address').optional().trim(),
    body('zip_code').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const userId = req.params.id;
      if (parseInt(req.userId) !== parseInt(userId) && req.cookies.userRole !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak." });
      }

      const { first_name, last_name, username, email, address, zip_code } = req.body;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }

      // Cek apakah email sudah digunakan oleh user lain
      if (email !== user.email) {
        const emailExist = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
        if (emailExist) {
          return res.status(409).json({ message: "Email sudah terdaftar" });
        }
      }

      user.first_name = first_name;
      user.last_name = last_name;
      user.username = username;
      user.email = email;
      user.address = address;
      user.zip_code = zip_code;

      await user.save();
      res.status(200).json({ message: "Data pengguna berhasil diperbarui.", user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      res.status(500).json({ message: "Gagal memperbarui data pengguna", error: err.message });
    }
  }
);

// Endpoint untuk menghapus pengguna
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }
    await user.destroy();
    res.status(200).json({ message: "Pengguna berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus pengguna", error: err.message });
  }
});

// Endpoint baru untuk mengubah role pengguna
router.put("/users/:id/role", async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }
    user.role = role;
    await user.save();
    res.status(200).json({ message: "Role pengguna berhasil diperbarui.", user });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui role", error: err.message });
  }
});

// Endpoint baru untuk mengubah password pengguna
router.put(
  "/users/:id/password",
  [
    body('newPassword').isLength({ min: 8 }).withMessage('Password minimal 8 karakter.'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.params.id;
      const { newPassword } = req.body;

      // Asumsi admin yang login memiliki ID 1 (ini tidak aman, hanya untuk contoh)
      // Di produksi, cek otorisasi admin dari token JWT
      if (req.cookies.userRole !== 'admin') {
          return res.status(403).json({ message: "Akses ditolak." });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }

      const hash = await bcrypt.hash(newPassword, 10);
      user.password = hash;
      await user.save();

      res.status(200).json({ message: "Password berhasil diperbarui." });
    } catch (err) {
      res.status(500).json({ message: "Gagal memperbarui password", error: err.message });
    }
  }
);

module.exports = router;