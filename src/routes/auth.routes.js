'use strict';

const express = require('express');
const router = express.Router();
const { guestOnly } = require('../middleware/guest-only');
const { csrf } = require('../middleware/csrf');
const authController = require('../controllers/auth.controller');

router.get('/login', guestOnly, authController.showLogin);
router.post('/login', guestOnly, csrf, authController.login);
router.post('/logout', csrf, authController.logout);

module.exports = router;