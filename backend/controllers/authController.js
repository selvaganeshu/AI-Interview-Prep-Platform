const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');
const generateTempPassword = require('../utils/generateTempPassword');

const buildUserResponse = (user, token) => ({
  success: true,
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  },
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id, user.role);

  res.status(201).json({
    ...buildUserResponse(user, token),
    message: 'User registered successfully',
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    ...buildUserResponse(user, token),
    message: 'Login successful',
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No user found with that email address');
  }

  // Generate a temporary password
  const tempPassword = generateTempPassword();
  const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

  // Store hashed temporary password with expiration (15 minutes)
  user.tempPassword = hashedTempPassword;
  user.tempPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Email message with temporary password
  const message = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your AI Interview Prep account.</p>
    <p><strong>Your temporary password is:</strong></p>
    <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace;">
      ${tempPassword}
    </h3>
    <p><strong>Important:</strong></p>
    <ul>
      <li>This temporary password is valid for 15 minutes</li>
      <li>Use this password to log in</li>
      <li>After logging in, you should change your password to a permanent one</li>
      <li>For security, do not share this password with anyone</li>
    </ul>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Temporary Password - AI Interview Prep',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Temporary password sent to your email successfully. Valid for 15 minutes.',
    });
  } catch (error) {
    user.tempPassword = undefined;
    user.tempPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    ...buildUserResponse(user, token),
    message: 'Password reset successful',
  });
});

// Login with temporary password and set new permanent password
const loginWithTempPassword = asyncHandler(async (req, res) => {
  const { email, tempPassword, newPassword } = req.body;

  // Find user with valid temporary password
  const user = await User.findOne({
    email,
    tempPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or temporary password');
  }

  // Verify temporary password
  const isTempPasswordValid = await bcrypt.compare(tempPassword, user.tempPassword);
  if (!isTempPasswordValid) {
    res.status(401);
    throw new Error('Invalid email or temporary password');
  }

  // Set new password
  user.password = newPassword;
  user.tempPassword = undefined;
  user.tempPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    ...buildUserResponse(user, token),
    message: 'Password updated successfully. You are now logged in.',
  });
});

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  loginWithTempPassword,
};
