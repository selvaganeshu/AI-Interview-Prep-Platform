const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Create first admin (only works if no admins exist)
exports.createFirstAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }

  // Check if any admin exists
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Admin user already exists. Use the admin panel to create additional admins.'
    });
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Create admin user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role: 'admin'
  });

  res.status(201).json({
    success: true,
    message: 'Admin user created successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// Create additional admin (protected - only existing admin can do this)
exports.createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user making request is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can create other admins'
    });
  }

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Create admin user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role: 'admin'
  });

  res.status(201).json({
    success: true,
    message: 'Admin user created successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// Check if admin exists
exports.checkAdminExists = asyncHandler(async (req, res) => {
  const existingAdmin = await User.findOne({ role: 'admin' });
  
  res.status(200).json({
    success: true,
    adminExists: !!existingAdmin
  });
});
