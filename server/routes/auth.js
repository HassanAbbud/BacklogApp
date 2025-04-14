const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // adjust if needed
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// 1️⃣ Forgot Password: Send reset link
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });

        // Optionally store token/expiry on user model
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 15 * 60 * 1000;


        // ✅ Tell Mongoose to persist these new fields
        user.markModified('resetToken');
        user.markModified('resetTokenExpire');
        console.log("📌 Preparing to save user...");
        console.log("resetToken (before save):", user.resetToken);
        console.log("resetTokenExpire (before save):", user.resetTokenExpire);


        await user.save();

        console.log("✅ Saved user.");
        const savedUser = await User.findById(user._id);
        console.log("🧾 Reloaded from DB:", {
            resetToken: savedUser.resetToken,
            resetTokenExpire: savedUser.resetTokenExpire,
        });

        console.log("💾 Saved reset token:", user.resetToken);

        const resetLink = `http://localhost:5173/reset-password/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: 'jangdajuber5@gmail.com',
            to: email,
            subject: 'Reset Your Password',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 15 minutes.</p>`
        });

        console.log(`✅ Reset link sent to: ${email}`);
        res.status(200).json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        res.status(500).json({ message: 'Failed to send email. Try again later.' });
    }
});

router.post('/debug-token', async (req, res) => {
    const user = await User.findOne({ email: 'jangdajuber@gmail.com' });
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    user.resetToken = 'manually-set-token-123';
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000;
  
    await user.save();
  
    const updatedUser = await User.findById(user._id);
    res.json({
      message: 'Token set manually',
      savedToken: updatedUser.resetToken,
      savedExpire: updatedUser.resetTokenExpire,
    });
  });
// 2️⃣ Reset Password: Validate token and update password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    console.log("🔐 Incoming token:", token);
    console.log("🔐 Incoming new password:", password);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("🔓 Decoded JWT:", decoded);

        const user = await User.findOne({ _id: decoded.id, resetToken: token });

        if (!user) {
            console.log("❌ No user found with matching token.");
            return res.status(400).json({ message: 'Token expired or invalid (no user)' });
        }

        console.log("👤 User found:", user.email);
        console.log("🕒 Token expires at:", user.resetTokenExpire);
        console.log("🕒 Current time is:", Date.now());

        if (user.resetTokenExpire < Date.now()) {
            console.log("❌ Token has expired.");
            return res.status(400).json({ message: 'Token expired or invalid (expired)' });
        }

        user.password = password;
        user.resetToken = null;
        user.resetTokenExpire = null;
        await user.save();
        const testUser = await User.findById(user._id);
        console.log("🔍 Password stored in DB after reset:", testUser.password);


        console.log("✅ Password reset successful for:", user.email);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('❌ Error verifying token or processing reset:', err);
        res.status(400).json({ message: 'Invalid token (catch)' });
    }
});
module.exports = router;

router.post('/test-login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) return res.status(401).json({ message: 'Password mismatch' });
  
    res.json({ message: 'Password matched ✅' });
  });
  