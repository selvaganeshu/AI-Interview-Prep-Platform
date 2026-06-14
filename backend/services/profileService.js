const CodingSubmission = require('../models/CodingSubmission');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');

const buildProfileCompletion = (user, latestResume) => {
  const fields = [
    Boolean(user.profileImage),
    Boolean(user.name),
    Boolean(user.phone),
    Boolean(user.college),
    Boolean(user.degree),
    Boolean(user.github),
    Boolean(user.linkedin),
    Boolean(latestResume),
    Boolean(
      latestResume?.parsedContent?.sections?.skills?.length ||
        latestResume?.analysis?.extractedSkills?.length
    ),
  ];

  const completedCount = fields.filter(Boolean).length;
  const percentage = Math.round((completedCount / fields.length) * 100);

  return {
    profileCompletion: percentage,
    completionDetails: {
      profilePicture: Boolean(user.profileImage),
      name: Boolean(user.name),
      phone: Boolean(user.phone),
      college: Boolean(user.college),
      degree: Boolean(user.degree),
      skills: Boolean(
        latestResume?.parsedContent?.sections?.skills?.length ||
          latestResume?.analysis?.extractedSkills?.length
      ),
      github: Boolean(user.github),
      linkedin: Boolean(user.linkedin),
      resume: Boolean(latestResume),
    },
  };
};

const buildRecentActivity = ({ latestResume, latestCoding, latestInterview, resumeScore }) => {
  const activity = [];

  if (latestResume) {
    activity.push({
      type: 'resume',
      label: 'Resume Analyzed',
      subtitle: `ATS Score ${resumeScore}%`,
      timestamp: latestResume.analysisGeneratedAt || latestResume.uploadDate || latestResume.createdAt,
    });
  }

  if (latestCoding) {
    activity.push({
      type: 'coding',
      label: latestCoding.status === 'success' ? 'Coding Challenge Solved' : 'Coding Submission',
      subtitle: latestCoding.challengeTitle || 'Coding activity',
      timestamp: latestCoding.createdAt,
    });
  }

  if (latestInterview) {
    activity.push({
      type: 'interview',
      label: 'Interview Completed',
      subtitle: latestInterview.title || 'Mock interview',
      timestamp: latestInterview.completedAt || latestInterview.createdAt,
    });
  }

  return activity
    .filter((item) => item.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

exports.getUserProfilePerformance = async (user) => {
  const userId = user._id;

  const [challengesSolved, latestCoding, completedInterviews, latestCompletedInterview, latestResume] = await Promise.all([
    CodingSubmission.countDocuments({ userId, status: 'success' }),
    CodingSubmission.findOne({ userId }).sort({ createdAt: -1 }).select('status createdAt challengeId'),
    Interview.find({ userId, status: 'completed' }).select('score completedAt title createdAt'),
    Interview.findOne({ userId, status: 'completed' }).sort({ completedAt: -1 }).select('score completedAt title createdAt'),
    Resume.findOne({ userId }).sort({ createdAt: -1 }).select('analysis atsScore analysisGeneratedAt uploadDate createdAt parsedContent'),
  ]);

  const interviewsDone = completedInterviews.length;
  const averageInterviewScore = interviewsDone
    ? Math.round(
        completedInterviews.reduce((sum, interview) => sum + (interview.score || 0), 0) /
          interviewsDone
      )
    : 0;

  const resumeScore = latestResume?.analysis?.atsScore?.score ?? latestResume?.analysis?.overallScore?.score ?? 0;

  const profileCompletionData = buildProfileCompletion(user, latestResume);
  const recentActivity = buildRecentActivity({
    latestResume,
    latestCoding,
    latestInterview: latestCompletedInterview,
    resumeScore,
  });

  return {
    challengesSolved,
    interviewsDone,
    averageInterviewScore,
    resumeScore,
    profileCompletion: profileCompletionData.profileCompletion,
    recentActivity,
  };
};
