const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUserDashboard, getUserProfile, updateUserProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/dashboard', protect, getUserDashboard);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
