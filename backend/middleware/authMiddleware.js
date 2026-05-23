const jwt = require('jsonwebtoken');
const { getDbMode } = require('../config/db');
const mockDb = require('../models/mockDb');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'purplezone_dev_secret_key_987654321';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      const isMock = getDbMode();

      if (isMock) {
        // Find mock user
        const user = mockDb.users.find(u => u.id === decoded.id);
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found in mock DB' });
        }
        req.user = { id: user.id, username: user.username };
      } else {
        // Find MongoDB user
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        req.user = { id: user._id, username: user.username };
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
