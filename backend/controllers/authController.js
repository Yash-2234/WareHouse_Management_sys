const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ActivityLog } = require('../models/Warehouse');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'wms_super_secret_enterprise_key_2026_rfid', {
    expiresIn: '30d'
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact administrator.' });
    }

    user.lastLogin = new Date();
    await user.save();

    await ActivityLog.create({
      user: user.name,
      action: 'USER_LOGIN',
      module: 'Authentication',
      description: `User '${user.email}' logged in successfully as ${user.role}`
    });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public / Admin
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Warehouse Operator',
      department: department || 'Logistics & Operations'
    });

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System Admin',
      action: 'USER_REGISTER',
      module: 'User Management',
      description: `New user created: ${user.name} (${user.role})`
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  registerUser,
  getMe
};
