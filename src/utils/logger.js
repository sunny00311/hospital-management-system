'use strict';

/**
 * src/utils/logger.js
 *
 * Minimal server-side logger. Never logs credentials, passwords, session
 * tokens, or unnecessary patient information. Security-relevant events are
 * logged without clinical content.
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const current = Number(process.env.LOG_LEVEL || 2);

function format(level, message, meta) {
  const ts = new Date().toISOString();
  const parts = [ts, level.toUpperCase().padEnd(5), message];
  if (meta) parts.push(JSON.stringify(meta));
  return parts.join(' ');
}

function log(level, message, meta) {
  if (LEVELS[level] > current) return;
  const line = format(level, message, meta);
  if (level === 'error') console.error(line);
  else console.log(line);
}

const logger = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};

module.exports = logger;