// server/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const setAuthCookie = (res, token, role, userId) => {
  const maxAge = parseInt(
    process.env.COOKIE_MAX_AGE || 7 * 24 * 60 * 60 * 1000,
    10
  );
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAMESITE || "Strict",
    maxAge,
    path: "/",
  });
  res.cookie("userRole", role, {
    httpOnly: false,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAMESITE || "Strict",
    maxAge,
    path: "/",
  });
  res.cookie("userId", userId, {
    httpOnly: false,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAMESITE || "Strict",
    maxAge,
    path: "/",
  });
};

exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      first_name,
      last_name,
      username,
      email,
      password,
      address,
      zip_code,
    } = req.body;

    const exist = await User.findOne({ where: { email } });
    if (exist)
      return res.status(409).json({ message: "Email sudah terdaftar" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name,
      last_name,
      username,
      email,
      password: hash,
      address,
      zip_code,
      role: "user",
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES || "7d",
      }
    );

    setAuthCookie(res, token, user.role, user.id);

    return res.status(201).json({
      message: "Signup berhasil",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Gagal signup", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES || "7d",
      }
    );

    setAuthCookie(res, token, user.role, user.id);

    return res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Gagal login", error: err.message });
  }
};

exports.logout = (_req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("userRole");
  res.clearCookie("userId");
  res.status(200).json({ message: "Logout berhasil" });
};