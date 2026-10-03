const User = require('../models/User');
const { ActivityLog } = require('../models/Warehouse');

// @desc    Get all system users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, status } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Warehouse Operator',
      department: department || 'Logistics & Warehouse Operations',
      status: status || 'Active'
    });

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System Admin',
      action: 'USER_CREATE',
      module: 'Administration',
      description: `Created user account '${user.email}' with role '${user.role}'`
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, role, department, status, password } = req.body;

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (status) user.status = status;
    if (password) user.password = password;

    await user.save();

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System Admin',
      action: 'USER_UPDATE',
      module: 'Administration',
      description: `Updated user account '${user.email}'`
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System Admin',
      action: 'USER_DELETE',
      module: 'Administration',
      description: `Deleted user account '${user.email}'`
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
