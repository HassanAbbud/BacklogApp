const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_jwt_secret';

const authMiddleware = async (req, res, next) => {
  try {
    // check for token in Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({ 
        message: 'No authorization header' 
      });
    }

    // extract token
    const token = authHeader.replace('Bearer ', '');

    // verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // find user
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    // attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Please authenticate', 
      error: error.message 
    });
  }
};

module.exports = authMiddleware;