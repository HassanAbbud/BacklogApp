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

const bcrypt = require('bcrypt');
const User = require('../models/user.model');

router.post('/test-login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    console.log("❌ Password mismatch");
    return res.status(401).json({ message: 'Password mismatch' });
  }

  console.log("✅ Password matched for:", email);
  return res.json({ message: 'Password matched ✅' });
});
