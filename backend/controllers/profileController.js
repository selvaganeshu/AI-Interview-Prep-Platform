const asyncHandler = require('../utils/asyncHandler');
const { getUserProfilePerformance } = require('../services/profileService');

exports.getProfilePerformance = asyncHandler(async (req, res) => {
  const performance = await getUserProfilePerformance(req.user);

  res.status(200).json({
    success: true,
    data: performance,
    message: 'Profile performance retrieved successfully',
  });
});
