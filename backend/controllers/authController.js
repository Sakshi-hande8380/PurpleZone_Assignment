const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDbMode } = require('../config/db');
const mockDb = require('../models/mockDb');

const JWT_SECRET = process.env.JWT_SECRET || 'purplezone_dev_secret_key_987654321';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long' });
  }

  // Security password validation check: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
    });
  }

  try {
    const isMock = getDbMode();

    if (isMock) {
      // Mock db implementation
      const userExists = mockDb.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (userExists) {
        return res.status(400).json({ message: 'User already exists (mock database)' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: `u_${Date.now()}`,
        username,
        password: hashedPassword,
        createdAt: new Date()
      };
      
      mockDb.users.push(newUser);

      return res.status(201).json({
        _id: newUser.id,
        username: newUser.username,
        token: generateToken(newUser.id),
        isMock: true
      });
    } else {
      // MongoDB Mongoose implementation
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        username,
        password
      });

      return res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
        isMock: false
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    const isMock = getDbMode();

    if (isMock) {
      // Mock db implementation
      const user = mockDb.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      return res.json({
        _id: user.id,
        username: user.username,
        token: generateToken(user.id),
        isMock: true
      });
    } else {
      // MongoDB Mongoose implementation
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      return res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
        isMock: false
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const isMock = getDbMode();

    if (isMock) {
      const user = mockDb.users.find(u => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({
        _id: user.id,
        username: user.username,
        isMock: true
      });
    } else {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({
        _id: user._id,
        username: user.username,
        isMock: false
      });
    }
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
};
