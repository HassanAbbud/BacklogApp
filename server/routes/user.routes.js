const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../security/verifyJWT');

// Open routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Verified routes
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;