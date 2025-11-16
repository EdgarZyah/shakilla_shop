const db = require("../models/index");
const { User } = db;
const jwt = require("jsonwebtoken");
const { Op } = db.Sequelize;

// Fungsi Pendaftaran Pengguna Baru
exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      address,
      zip_code,
      phone_number,
    } = req.body;

    if (
      !email ||
      !password ||
      !first_name ||
      !last_name ||
      !username ||
      !phone_number
    ) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      let field = existingUser.email === email ? "Email" : "Username";
      return res.status(409).json({ message: `${field} sudah terdaftar.` });
    }

    const existingPhone = await User.findOne({ where: { phone_number } });
    if (existingPhone) {
      return res.status(409).json({ message: "Nomor telepon sudah terdaftar." });
    }

    const newUser = await User.create({
      first_name: first_name,
      last_name: last_name,
      username,
      email,
      password,
      address,
      zip_code,
      phone_number: phone_number,
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(201).json({
      message: "Pendaftaran berhasil!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        first_name: newUser.first_name,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Pendaftaran gagal karena kesalahan server.",
      error: error.message,
    });
  }
};

// Fungsi Login Pengguna
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi." });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.isValidPassword(password)) {
      return res.status(401).json({ message: "Email atau Password salah." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login berhasil!",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        address: user.address,
        zip_code: user.zip_code,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({
        message: "Login gagal karena kesalahan server.",
        error: error.message,
      });
  }
};

// Fungsi untuk mendapatkan data user berdasarkan token yang aktif
exports.getProfile = (req, res) => {
  res.status(200).json({
    message: "Profile berhasil diambil.",
    user: {
      id: req.user.id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,
      address: req.user.address,
      zip_code: req.user.zip_code,
      username: req.user.username,
      phone_number: req.user.phone_number,
    },
  });
};