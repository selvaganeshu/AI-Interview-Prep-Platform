const express = require('express');
const { body } = require('express-validator');
const {
  createFirstAdmin,
  createAdminUser,
  checkAdminExists
} = require('../controllers/adminSetupController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Check if admin exists (public endpoint)
router.get('/check-admin', checkAdminExists);

// Create first admin (no auth required, only works once)
router.post('/setup/first-admin', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], validate, createFirstAdmin);

// Create additional admin (protected - admin only)
router.post('/create-admin', protect, authorize('admin'), [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], validate, createAdminUser);

module.exports = router;
