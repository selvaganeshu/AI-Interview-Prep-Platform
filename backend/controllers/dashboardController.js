const asyncHandler = require('../utils/asyncHandler');
const { getDashboardData } = require('../services/dashboardService');

exports.getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getDashboardData(req.user);

  res.status(200).json({
    success: true,
    data: dashboard,
    message: 'Dashboard retrieved successfully',
  });
});
