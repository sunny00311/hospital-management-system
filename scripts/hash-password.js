'use strict';

/**
 * scripts/hash-password.js
 *
 * Generates a bcrypt hash for a plaintext password. Usage:
 *   node scripts/hash-password.js "your-password"
 *
 * The output hash is intended to be inserted into the users table (or used
 * to replace the placeholder admin password in the reference seed).
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(hash);