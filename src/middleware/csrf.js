'use strict';

/**
 * src/middleware/csrf.js
 *
 * CSRF protection for state-changing POST forms. The token is stored in the
 * session and emitted in forms. Tokens are rotated per session and per request
 * to defeat the Synchronizer Token Pattern.
 */

const crypto = require('crypto');

function ensureCsrfToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(16).toString('hex');
  }
  next();
}

function csrf(req, res, next) {
  // Skip CSRF check for GET/HEAD/OPTIONS.
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const token = (req.body && req.body._csrf) || req.headers['x-csrf-token'];
  const sessionToken = req.session && req.session.csrfToken;

  if (!token || !sessionToken || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken))) {
    return res.status(403).render('errors/403', {
      title: 'Invalid CSRF token',
      message: 'Your session token expired. Please reload the page and try again.',
    });
  }
  // Rotate token after use.
  req.session.csrfToken = crypto.randomBytes(16).toString('hex');
  next();
}

function csrfToken(req, res, next) {
  ensureCsrfToken(req, res, next);
}

module.exports = { csrf, csrfToken };