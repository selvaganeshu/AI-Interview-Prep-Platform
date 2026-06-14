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
    Boolean(latestResume?.analysis?.extractedSkills?.length || latestResume?.parsedContent?.sections?.skills?.length),
  ];
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

const getConsecutiveStudyStreak = (activityDates) => {
  if (!activityDates.size) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let day = new Date(today);

  while (true) {
    const key = day.toISOString().slice(0, 10);
    if (activityDates.has(key)) {
      streak += 1;
      day.setDate(day.getDate() - 1);
      continue;
    }
    break;
  }

  return streak;
};

const formatStreak = (days) => `${days} day${days === 1 ? '' : 's'}`;

const getInterviewReadinessLabel = (score) => {
  if (score >= 85) return 'On track';
  if (score >= 70) return 'Improving';
  if (score >= 55) return 'Needs more practice';
  return 'Needs focused preparation';
};

const relativeTimeLabel = (date) => {
  if (!date) return 'recently';
  const now = Date.now();
  const then = new Date(date).getTime();
  const delta = Math.max(0, now - then);
  const minutes = Math.floor(delta / 60000);
  const hours = Math.floor(delta / 3600000);
  const days = Math.floor(delta / 86400000);

  if (days >= 2) return `${days} days ago`;
  if (days === 1) return 'Yesterday';
  if (hours >= 1) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes >= 1) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return 'Just now';
};

const getDashboardData = async (user) => {
  const userId = user._id;
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const [codingCount, interviewStats, weakTopicsAggregation, resume, codingByDay, interviewByDay] = await Promise.all([
    CodingSubmission.countDocuments({ userId }),
    Interview.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          completedInterviews: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
          totalScore: { $sum: '$score' },
        },
      },
    ]),
    Interview.aggregate([
      { $match: { userId, status: 'completed', categories: { $exists: true, $ne: [] } } },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          avgScore: { $avg: '$score' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          avgScore: { $round: ['$avgScore', 0] },
          weaknessLevel: { $round: [{ $subtract: [100, '$avgScore'] }, 0] },
          count: 1,
        },
      },
      { $sort: { avgScore: 1, count: -1 } },
      { $limit: 5 },
    ]),
    Resume.findOne({ userId })
      .sort({ createdAt: -1 })
      .select('analysis atsScore analysisGeneratedAt uploadDate parsedContent'),
    CodingSubmission.aggregate([
      { $match: { userId, createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          practiceCount: { $sum: 1 },
        },
      },
    ]),
    Interview.aggregate([
      { $match: { userId, completedAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
          averageScore: { $avg: '$score' },
          interviewCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const completedInterviews = interviewStats?.[0]?.completedInterviews || 0;
  const totalInterviewScore = interviewStats?.[0]?.totalScore || 0;
  const averageScoreValue = completedInterviews ? Math.round(totalInterviewScore / completedInterviews) : 0;
  const averageScore = `${averageScoreValue}%`;

  const mockInterviews = completedInterviews;
  const questionsPracticed = codingCount;

  const activityDates = new Set();
  const allRecentCoding = await CodingSubmission.find({ userId, createdAt: { $gte: startOfWeek } }).select('createdAt');
  const allRecentInterviews = await Interview.find({ userId, completedAt: { $gte: startOfWeek } }).select('completedAt');

  allRecentCoding.forEach((item) => {
    activityDates.add(new Date(item.createdAt).toISOString().slice(0, 10));
  });
  allRecentInterviews.forEach((item) => {
    activityDates.add(new Date(item.completedAt).toISOString().slice(0, 10));
  });

  const streakDays = getConsecutiveStudyStreak(activityDates);
  const studyStreak = formatStreak(streakDays);

  const resumeScore = resume?.analysis?.atsScore?.score || resume?.analysis?.overallScore?.score || 0;
  const readinessScore = Math.round(
    Math.min(
      100,
      averageScoreValue * 0.6 + (resumeScore || averageScoreValue) * 0.25 + Math.min(mockInterviews, 10) * 1.5
    )
  );

  const interviewReadiness = getInterviewReadinessLabel(readinessScore);

  const weakTopics = weakTopicsAggregation.map((topic) => ({
    topic: topic.topic,
    level: topic.weaknessLevel,
  }));

  const buildProgressTrend = () => {
    const trend = [];
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      const key = date.toISOString().slice(0, 10);
      const codingEntry = codingByDay.find((entry) => entry._id === key);
      const interviewEntry = interviewByDay.find((entry) => entry._id === key);
      const practice = codingEntry?.practiceCount || 0;
      const progress = interviewEntry?.averageScore ? Math.round(interviewEntry.averageScore) : Math.min(80, 40 + practice * 5);
      trend.push({ week: dayLabel, progress, practice });
    }
    return trend;
  };

  const buildRecentHistory = async () => {
    const history = [];

    if (resume) {
      history.push(`Resume analyzed ${relativeTimeLabel(resume.analysisGeneratedAt || resume.uploadDate || resume.createdAt)}`);
    }

    const [latestCoding] = await CodingSubmission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .select('status createdAt challengeId');

    if (latestCoding) {
      history.push(
        `${latestCoding.status === 'success' ? 'Coding challenge solved' : 'Coding submission completed'} ${relativeTimeLabel(latestCoding.createdAt)}`
      );
    }

    const [latestInterview] = await Interview.find({ userId, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(1)
      .select('title completedAt');

    if (latestInterview) {
      history.push(`Interview completed ${relativeTimeLabel(latestInterview.completedAt)}`);
    }

    return history.slice(0, 5);
  };

  const profileCompletion = buildProfileCompletion(user, resume);
  const recentHistory = await buildRecentHistory();

  const recommendations = [];
  if (profileCompletion < 80) {
    recommendations.push('Complete your profile details to improve your readiness score.');
  }
  if (studyStreak && streakDays < 4) {
    recommendations.push('Practice consistently to build a stronger study streak.');
  }
  if (averageScoreValue < 70) {
    recommendations.push('Review your last interview feedback and strengthen weak topics.');
  }
  if (weakTopics.length) {
    recommendations.push(`Focus on ${weakTopics[0].topic} to improve your next mock interview.`);
  }
  if (!recommendations.length) {
    recommendations.push('Keep up the momentum with daily practice and mock interviews.');
  }

  return {
    mockInterviews,
    questionsPracticed,
    averageScore,
    studyStreak,
    interviewReadiness,
    weakTopics,
    profileCompletion: buildProfileCompletion(user, resume),
    recentHistory,
    recommendations,
    progressTrend: buildProgressTrend(),
  };
};

module.exports = {
  getDashboardData,
};
