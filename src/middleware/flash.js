'use strict';

/**
 * src/middleware/flash.js
 *
 * One-time flash messages carried across the Post/Redirect/Get pattern.
 * Messages are read and cleared on the next request.
 */

function flash(req, res, next) {
  const messages = req.session.flash || [];
  delete req.session.flash;
  req.flash = {
    success: messages.filter((m) => m.type === 'success').map((m) => m.text),
    error: messages.filter((m) => m.type === 'error').map((m) => m.text),
    info: messages.filter((m) => m.type === 'info').map((m) => m.text),
  };
  res.locals.flash = req.flash;
  next();
}

function setFlash(req, type, text) {
  if (!req.session.flash) req.session.flash = [];
  req.session.flash.push({ type, text });
}

module.exports = { flash, setFlash };