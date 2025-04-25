const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Middleware: Protect route (require login)
exports.protect = async (req, res, next) => {
  let token;
  console.log('Cookies:', req.cookies);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // ✅ ตรวจว่าไม่มี token หรือส่ง "none" มา
  if (!token || token === 'none') {
    return res.status(401).json({
      success: false,
      message: req.__('no_token_provided')
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    return res.status(401).json({
      success: false,
      message: req.__('token_verification_failed')
    });
  }
};

// 🛡️ Middleware: Role-based access
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: req.__('not_authorized_role', { role: req.user.role })
      });
    }
    next();
  };
};
