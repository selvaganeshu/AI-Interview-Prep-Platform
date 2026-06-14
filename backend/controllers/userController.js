const asyncHandler = require('../utils/asyncHandler');

const getUserDashboard = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      dashboard: {
        mockInterviews: 14,
        questionsPracticed: 162,
        averageScore: '81%',
        studyStreak: '9 days',
      },
    },
    message: 'User dashboard retrieved successfully',
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        location: user.location,
        college: user.college,
        degree: user.degree,
        graduationYear: user.graduationYear,
        bio: user.bio,
        github: user.github,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        resumeUrl: user.resumeUrl,
        resumeScore: user.resumeScore,
        resumeAnalyzedAt: user.resumeAnalyzedAt,
        codingSolved: user.codingSolved,
        interviewsCompleted: user.interviewsCompleted,
        avgInterviewScore: user.avgInterviewScore,
        createdAt: user.createdAt,
      },
    },
    message: 'Profile retrieved successfully',
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, location, college, degree, graduationYear, bio, github, linkedin, portfolio } = req.body;

  const user = req.user;

  // Update profile fields
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (location !== undefined) user.location = location;
  if (college !== undefined) user.college = college;
  if (degree !== undefined) user.degree = degree;
  if (graduationYear !== undefined) user.graduationYear = graduationYear;
  if (bio !== undefined) user.bio = bio;
  if (github !== undefined) user.github = github;
  if (linkedin !== undefined) user.linkedin = linkedin;
  if (portfolio !== undefined) user.portfolio = portfolio;

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        location: user.location,
        college: user.college,
        degree: user.degree,
        graduationYear: user.graduationYear,
        bio: user.bio,
        github: user.github,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        resumeUrl: user.resumeUrl,
        resumeScore: user.resumeScore,
        resumeAnalyzedAt: user.resumeAnalyzedAt,
        codingSolved: user.codingSolved,
        interviewsCompleted: user.interviewsCompleted,
        avgInterviewScore: user.avgInterviewScore,
        createdAt: user.createdAt,
      },
    },
    message: 'Profile updated successfully',
  });
});

module.exports = {
  getUserDashboard,
  getUserProfile,
  updateUserProfile,
};
