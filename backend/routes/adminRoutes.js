const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

router.get(
  '/dashboard',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Admin dashboard retrieved successfully',
      data: {
        stats: {
          totalUsers: 1248,
          activeSessions: 86,
          mockInterviews: 3420,
          averageScore: '74%',
        },
      },
    });
  })
);

module.exports = router;
