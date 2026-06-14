const express = require('express');
const {
  getChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  runCode,
  submitSolution,
  getUserSubmissions,
  getCodingAnalytics,
  getAllSubmissions,
  getSubmission,
  getExecutionHistory,
  getExecutionHistoryByChallengeId,
  deleteExecutionHistory,
} = require('../controllers/codingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/challenges', getChallenges);
router.get('/challenges/:challengeId', getChallenge);
router.post('/challenges', authorize('admin'), createChallenge);
router.put('/challenges/:challengeId', authorize('admin'), updateChallenge);
router.delete('/challenges/:challengeId', authorize('admin'), deleteChallenge);
router.post('/run', runCode);
router.post('/challenges/:challengeId/submit', submitSolution);
router.get('/history', getUserSubmissions);
router.get('/submissions', getUserSubmissions);
router.get('/submissions/all', authorize('admin'), getAllSubmissions);
router.get('/submissions/:submissionId', getSubmission);
router.get('/analytics', getCodingAnalytics);

// Execution history routes
router.get('/execution-history', getExecutionHistory);
router.get('/execution-history/challenge/:challengeId', getExecutionHistoryByChallengeId);
router.delete('/execution-history/:historyId', deleteExecutionHistory);

module.exports = router;
