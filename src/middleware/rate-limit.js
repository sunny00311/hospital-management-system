'use strict';

/**
 * src/middleware/rate-limit.js
 *
 * Rate limiting for abuse-prone endpoints (login, logout).
 */

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many login attempts. Please try again later.',
  },
});

module.exports = { loginLimiter };