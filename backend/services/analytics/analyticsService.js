/**
 * Analytics Service
 * Handles user analytics, dashboard statistics, and performance metrics
 */

const User = require('../../models/User');
const Interview = require('../../models/Interview');
const CodingSubmission = require('../../models/CodingSubmission');
const CodingChallenge = require('../../models/CodingChallenge');

const analyticsService = {
  /**
   * Get user dashboard statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Dashboard stats
   */
  getDashboardStats: async (userId) => {
    try {
      const user = await User.findById(userId);
      const interviewCount = await Interview.countDocuments({ userId });
      const submissions = await CodingSubmission.find({ userId }).select('score');
      const challenges = await CodingChallenge.countDocuments();

      const avgScore =
        submissions.length > 0
          ? submissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / submissions.length
          : 0;

      return {
        totalInterviews: interviewCount,
        totalChallenges: challenges,
        solvedChallenges: submissions.length,
        averageScore: Math.round(avgScore * 100) / 100,
        userLevel: user.level || 'Beginner',
        streak: user.streak || 0,
      };
    } catch (error) {
      throw new Error(`Error fetching dashboard stats: ${error.message}`);
    }
  },

  /**
   * Get user performance metrics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Performance metrics
   */
  getPerformanceMetrics: async (userId) => {
    try {
      const submissions = await CodingSubmission.find({ userId })
        .select('score createdAt language')
        .sort({ createdAt: -1 })
        .limit(30);

      const interviews = await Interview.find({ userId }).select('score createdAt');

      const languageStats = {};
      submissions.forEach((sub) => {
        if (!languageStats[sub.language]) {
          languageStats[sub.language] = { count: 0, totalScore: 0 };
        }
        languageStats[sub.language].count += 1;
        languageStats[sub.language].totalScore += sub.score || 0;
      });

      Object.keys(languageStats).forEach((lang) => {
        languageStats[lang].avgScore =
          Math.round(
            (languageStats[lang].totalScore / languageStats[lang].count) * 100,
          ) / 100;
      });

      return {
        submissions: submissions.length,
        interviews: interviews.length,
        languageStats,
        recentSubmissions: submissions.slice(0, 10),
        averageInterviewScore:
          interviews.length > 0
            ? Math.round(
                (interviews.reduce((acc, int) => acc + (int.score || 0), 0) /
                  interviews.length) *
                  100,
              ) / 100
            : 0,
      };
    } catch (error) {
      throw new Error(`Error fetching performance metrics: ${error.message}`);
    }
  },

  /**
   * Get topic-wise performance
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Topic stats
   */
  getTopicStats: async (userId) => {
    try {
      const challenges = await CodingChallenge.find().select('topic difficulty');
      const submissions = await CodingSubmission.find({ userId }).select('challengeId score');

      const challengeMap = {};
      challenges.forEach((challenge) => {
        challengeMap[challenge._id] = challenge;
      });

      const topicStats = {};
      submissions.forEach((sub) => {
        const challenge = challengeMap[sub.challengeId];
        if (challenge) {
          const topic = challenge.topic || 'Unknown';
          if (!topicStats[topic]) {
            topicStats[topic] = { attempted: 0, solved: 0, avgScore: 0, totalScore: 0 };
          }
          topicStats[topic].attempted += 1;
          topicStats[topic].totalScore += sub.score || 0;
          if (sub.score >= 80) topicStats[topic].solved += 1;
        }
      });

      Object.keys(topicStats).forEach((topic) => {
        topicStats[topic].avgScore =
          Math.round((topicStats[topic].totalScore / topicStats[topic].attempted) * 100) / 100;
      });

      return topicStats;
    } catch (error) {
      throw new Error(`Error fetching topic stats: ${error.message}`);
    }
  },

  /**
   * Get user streak information
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Streak data
   */
  getStreakInfo: async (userId) => {
    try {
      const submissions = await CodingSubmission.find({ userId })
        .select('createdAt')
        .sort({ createdAt: -1 });

      if (submissions.length === 0) {
        return { currentStreak: 0, longestStreak: 0, totalDays: 0 };
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;
      let prevDate = null;

      for (let i = 0; i < submissions.length; i++) {
        const currentDate = new Date(submissions[i].createdAt).toDateString();

        if (prevDate) {
          const dayDiff = (new Date(prevDate) - new Date(currentDate)) / (1000 * 60 * 60 * 24);

          if (dayDiff === 1) {
            tempStreak += 1;
          } else if (dayDiff > 1) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }

        prevDate = currentDate;
      }

      currentStreak = tempStreak;
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        currentStreak,
        longestStreak,
        totalDays: submissions.length,
      };
    } catch (error) {
      throw new Error(`Error fetching streak info: ${error.message}`);
    }
  },
};

module.exports = analyticsService;
