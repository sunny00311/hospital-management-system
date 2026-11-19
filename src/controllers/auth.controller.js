'use strict';

/**
 * src/controllers/auth.controller.js
 */

const authService = require('../services/auth.service');
const { setFlash } = require('../middleware/flash');

async function showLogin(req, res) {
  res.render('auth/login', { title: 'Login' });
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    setFlash(req, 'error', 'Username and password are required.');
    return res.redirect('/login');
  }

  const user = await authService.authenticate(username, password);

  if (!user) {
    setFlash(req, 'error', 'Invalid username or password.');
    return res.redirect('/login');
  }

  // Regenerate session ID after successful login
  req.session.regenerate((err) => {
    if (err) {
      setFlash(req, 'error', 'Session error. Please try again.');
      return res.redirect('/login');
    }

    req.session.user = user;
    authService.recordLogin(user.user_id);
    setFlash(req, 'success', `Welcome, ${user.full_name}!`);
    res.redirect('/dashboard');
  });
}

async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('hms.sid');
    res.redirect('/login');
  });
}

module.exports = { showLogin, login, logout };