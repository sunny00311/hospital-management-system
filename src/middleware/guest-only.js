'use strict';

/**
 * src/middleware/guest-only.js
 *
 * guestOnly: redirect authenticated users away from the login page.
 */

function guestOnly(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  return next();
}

module.exports = { guestOnly };