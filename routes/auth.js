const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register new user
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current logged-in user
router.get('/me', protect, getMe);

router.get('/logout', logout);

module.exports = router;
