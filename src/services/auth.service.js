'use strict';

/**
 * src/services/auth.service.js
 *
 * Authentication business rules: credential verification, session creation,
 * and last-login tracking. No Express objects here.
 */

const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const authRepo = require('../repositories/auth.repository');

const SALT_ROUNDS = 10;

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

async function authenticate(username, password) {
  const user = await authRepo.findUserByUsername(username);
  if (!user) {
    // Do not reveal whether username or password was incorrect.
    return null;
  }
  if (!user.is_active) {
    logger.warn('Login attempt for inactive user', { username });
    return null;
  }
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    logger.warn('Failed login attempt', { username });
    return null;
  }
  return {
    user_id: user.user_id,
    username: user.username,
    role: user.role,
    full_name: user.full_name,
    doctor_id: user.doctor_id,
  };
}

async function recordLogin(user_id) {
  try {
    await authRepo.updateLastLogin(user_id);
  } catch (err) {
    logger.error('Failed to record last login', { user_id, err: err.message });
  }
}

module.exports = { verifyPassword, hashPassword, authenticate, recordLogin };