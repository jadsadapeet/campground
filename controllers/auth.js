const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, telephone, email, password } = req.body;

    const user = await User.create({
      name,
      telephone,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
} catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
  
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  try {
    // Check user exists + select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔐 Helper function to send token
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
  
    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 วัน
      httpOnly: true, // ป้องกัน JavaScript access
    };
  
    // หากรันบน production ให้เพิ่ม secure cookie
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
  
    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token
      });
  };

// controllers/auth.js

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 1000) // หมดอายุใน 10 วิ
  });

  res.status(200).json({
    success: true,
    message: req.__('logged_out') 
  });
};

  