const express = require('express');
const {
  createInterview,
  generateQuestions,
  getInterview,
  startInterview,
  submitAnswer,
  completeInterview,
  getUserInterviews,
  getInterviewStats,
  getQuestion,
  getInterviewResults,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Interview management
router.post('/', createInterview);
router.get('/', getUserInterviews);
router.get('/stats', getInterviewStats);
router.get('/:interviewId', getInterview);
router.post('/:interviewId/start', startInterview);
router.post('/:interviewId/complete', completeInterview);
router.get('/:interviewId/results', getInterviewResults);
router.delete('/:interviewId', deleteInterview);

// Question management
router.post('/:interviewId/generate-questions', generateQuestions);
router.get('/:interviewId/question/:questionId', getQuestion);

// Answer submission
router.post('/:interviewId/question/:questionId/submit', submitAnswer);

module.exports = router;
