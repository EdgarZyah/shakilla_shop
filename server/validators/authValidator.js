// server/validators/authValidator.js
const { body } = require('express-validator');

exports.signupRules = [
  body('first_name').trim().notEmpty().withMessage('Nama depan wajib'),
  body('last_name').trim().notEmpty().withMessage('Nama belakang wajib'),
  body('username').trim().notEmpty().withMessage('Username wajib'),
  body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  body('address').optional().trim(),
  body('zip_code').optional().trim().isLength({ min: 5, max: 5 }).withMessage('Kode pos harus 5 digit'),
];

exports.loginRules = [
  body('email').isEmail().withMessage('Email tidak valid').normalizeEmail(),
  body('password').notEmpty().withMessage('Password wajib'),
];