// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/authController');
const { signupRules, loginRules } = require('../validators/authValidator');

router.post('/signup', signupRules, signup);
router.post('/login', loginRules, login);
router.post('/logout', logout);

module.exports = router;