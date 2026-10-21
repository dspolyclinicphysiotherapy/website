const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'kinetic_pulse_physio_ultra_secure_key_2026_#@!';
const TOKEN_EXPIRY = '12h';

function authenticateAdmin(username, password) {
  const settings = db.getSettings();
  const admin = settings.adminUser || {
    username: "admin",
    passwordHash: "$2b$10$sZD3is6tSVZhs6Agy21b8eqf2BabFrPSRrFvGT4vVQkQCxzRxC.1u"
  };

  if (!username || !password) return null;

  if (username.trim().toLowerCase() !== admin.username.toLowerCase()) {
    return null;
  }

  const matches = bcrypt.compareSync(password, admin.passwordHash);
  if (!matches) return null;

  const token = jwt.sign(
    {
      role: 'admin',
      user: admin.username,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  db.logAudit("ADMIN_LOGIN_SUCCESS", admin.username, "Admin logged into CRM panel");
  return token;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Express Middleware for protected admin routes
function requireAdminAuth(req, res, next) {
  let token = null;

  // Check Authorization header: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.admin_token) {
    // Check cookie
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please log into the Admin CRM."
    });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: "Session expired or invalid credentials. Please log in again."
    });
  }

  req.admin = payload;
  next();
}

module.exports = {
  authenticateAdmin,
  verifyToken,
  requireAdminAuth
};
