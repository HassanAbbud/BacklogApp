const User = require('../models/user.model');
const Game = require('../models/game.model');
const jwt = require('jsonwebtoken');

// Secret key in production, use environment variable
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_jwt_secret';

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check existing user
    let existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // create new user
    const user = new User({
      username,
      email,
      password 
    });

    await user.save();

    // generate token
    const token = jwt.sign(
      { id: user._id }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // req.user is added by the auth middleware
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('games');

    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};