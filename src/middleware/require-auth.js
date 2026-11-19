'use strict';

/**
 * src/middleware/require-auth.js
 *
 * requireAuth: redirect to /login when no authenticated session exists.
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
}

module.exports = { requireAuth };