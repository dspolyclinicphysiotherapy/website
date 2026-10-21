const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configure Helmet security headers
const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  });
};

// Rate limiter for admin login (stops brute force attacks)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many failed login attempts. For security reasons, please try again in 15 minutes."
  }
});

// Rate limiter for public lead submission & booking (prevents bot spam & DDoS)
const publicBookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 submissions per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "You have submitted multiple appointment requests. Please wait a few moments or call us directly."
  }
});

// Input Sanitizer to neutralize XSS injection
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // remove dangerous < >
    .replace(/javascript:/gi, '')
    .substring(0, 500); // cap length
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      cleaned[key] = sanitizeString(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value;
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(v => typeof v === 'string' ? sanitizeString(v) : v);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Honeypot bot protection middleware
function verifyHoneypot(req, res, next) {
  // If the honeypot field is filled, it's an automated bot
  if (req.body && req.body.hp_clinic_token) {
    console.warn(`[Security] Honeypot triggered from IP: ${req.ip}`);
    // Return dummy success so the bot stops trying without alerting the attacker
    return res.status(200).json({
      success: true,
      message: "Request received successfully."
    });
  }
  next();
}

module.exports = {
  configureHelmet,
  loginLimiter,
  publicBookingLimiter,
  sanitizeString,
  sanitizeObject,
  verifyHoneypot
};
