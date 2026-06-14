const asyncHandler = require('../utils/asyncHandler');
const Interview = require('../models/Interview');
const InterviewQuestion = require('../models/InterviewQuestion');
const InterviewResponse = require('../models/InterviewResponse');
const aiService = require('../utils/aiService');

/**
 * Create a new interview session
 */
exports.createInterview = asyncHandler(async (req, res, next) => {
  const { title, description, interviewType, categories, difficulty, duration } = req.body;

  if (!title || !title.trim() || !interviewType || !difficulty) {
    return res.status(400).json({
      success: false,
      message: 'Title, interview type, and difficulty are required',
    });
  }

  const categoryList = Array.isArray(categories)
    ? categories
    : typeof categories === 'string'
    ? categories.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const interview = await Interview.create({
    userId: req.user._id,
    title: title.trim(),
    description: description || '',
    interviewType,
    categories: categoryList,
    difficulty,
    duration: Number(duration) || 30,
    status: 'not_started',
  });

  res.status(201).json({
    success: true,
    message: 'Interview created successfully',
    data: interview,
  });
});

/**
 * Generate interview questions
 */
exports.generateQuestions = asyncHandler(async (req, res, next) => {
  const { interviewId } = req.params;
  const { questionCount } = req.body;

  const interview = await Interview.findById(interviewId);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found',
    });
  }

  if (interview.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to generate questions for this interview',
    });
  }

  try {
    // Generate questions using AI
    const questions = await aiService.generateQuestions(
      interview.interviewType,
      interview.difficulty,
      interview.categories,
      questionCount || 5
    );

    // Save questions to database
    const savedQuestions = await InterviewQuestion.insertMany(
      questions.map(q => ({
        ...q,
        interviewId,
      }))
    );

    // Update interview with questions
    interview.questions = savedQuestions.map(q => q._id);
    interview.totalQuestions = savedQuestions.length;
    await interview.save();

    res.status(201).json({
      success: true,
      message: 'Questions generated successfully',
      data: {
        interview,
        questions: savedQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to generate questions: ${error.message}`,
    });
  }
});

/**
 * Get interview details with questions
 */
exports.getInterview = asyncHandler(async (req, res, next) => {
  const { interviewId } = req.params;

  const interview = await Interview.findById(interviewId)
    .populate({
      path: 'questions',
      select: 'questionText category difficulty hints orderNumber',
    })
    .populate({
      path: 'responses',
      select: 'questionId userAnswer aiEvaluation timeTaken',
    });

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found',
    });
  }

  if (interview.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this interview',
    });
  }

  res.status(200).json({
    success: true,
    data: interview,
  });
});

/**
 * Start interview
 */
exports.startInterview = asyncHandler(async (req, res, next) => {
  const { interviewId } = req.params;

  const interview = await Interview.findById(interviewId);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found',
    });
  }

  if (interview.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to start this interview',
    });
  }

  interview.status = 'in_progress';
  interview.startTime = new Date();
  await interview.save();

  res.status(200).json({
    success: true,
    message: 'Interview started',
    data: interview,
  });
});

/**
 * Submit answer for a question
 */
exports.submitAnswer = asyncHandler(async (req, res, next) => {
  const { interviewId, questionId } = req.params;
  const { userAnswer, timeTaken } = req.body;

  if (!userAnswer || userAnswer.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Answer cannot be empty',
    });
  }

  const interview = await Interview.findById(interviewId);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found',
    });
  }

  if (interview.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to submit answers for this interview',
    });
  }

  const question = await InterviewQuestion.findById(questionId);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found',
    });
  }

  try {
    // Evaluate answer using AI
    const evaluation = await aiService.evaluateAnswer(
      question.questionText,
      userAnswer,
      question.expectedAnswer,
      question.difficulty
    );

    // Create response record
    const response = await InterviewResponse.create({
      interviewId,
      questionId,
      userAnswer,
      aiEvaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        areasForImprovement: evaluation.areasForImprovement,
        suggestions: evaluation.suggestions,
      },
      timeTaken: timeTaken || 0,
    });

    // Add response to interview
    interview.responses.push(response._id);

    // Calculate overall score
    const allResponses = await InterviewResponse.find({ interviewId });
    const totalScore = allResponses.reduce((sum, r) => sum + (r.aiEvaluation?.score || 0), 0) / allResponses.length;
    interview.score = Math.round(totalScore);

    await interview.save();

    res.status(201).json({
      success: true,
      message: 'Answer submitted and evaluated',
      data: {
        response: response.populate('questionId'),
        currentScore: interview.score,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to evaluate answer: ${error.message}`,
    });
  }
});

/**
 * Complete interview
 */
exports.completeInterview = asyncHandler(async (req, res, next) => {
  const { interviewId } = req.params;

  const interview = await Interview.findById(interviewId)
    .populate('questions')
    .populate('responses');

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found',
    });
  }

  if (interview.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to complete this interview',
    });
  }

  try {
    // Generate overall feedback
    const overallFeedback = await aiService.generateInterviewFeedback(interview);

    interview.status = 'completed';
    interview.endTime = new Date();
    interview.completedAt = new Date();
    interview.feedback = overallFeedback.overallAssessment;

    // Calculate final score if not already set
    if (interview.score === 0 && interview.responses.length > 0) {
      const totalScore = interview.responses.reduce((sum, r) => sum + (r.aiEvaluation?.score || 0), 0) / interview.responses.length;
      interview.score = Math.round(totalScore);
    }

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview completed',
      data: {
        interview,
        feedback: overallFeedback,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to complete interview: ${error.message}`,
    });
  }
});

/**
 * Get all interviews for user
 */
exports.getUserInterviews = asyncHandler(async (req, res, next) => {
  const interviews = await Interview.find({ userId: req.user._id })
    .select('title interviewType difficulty status score createdAt completedAt totalQuestions')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: interviews,
  });
});

/**
 * Get interview statistics for user
 */
exports.getInterviewStats = asyncHandler(async (req, res, next) => {
  const interviews = await Interview.find({ userId: req.user._id });

  const stats = {
    totalInterviews: interviews.length,
    completedInterviews: interviews.filter(i => i.status === 'completed').length,
    inProgressInterviews: interviews.filter(i => i.status === 'in_progress').length,
    averageScore: 0,
    interviewsByType: {
      technical: interviews.filter(i => i.interviewType === 'technical').length,
      hr: interviews.filter(i => i.interviewType === 'hr').length,
      behavioral: interviews.filter(i => i.interviewType === 'behavioral').length,
    },
    interviewsByDifficulty: {
      Easy: interviews.filter(i => i.difficulty === 'Easy').length,
      Medium: interviews.filter(i => i.difficulty === 'Medium').length,
      Hard: interviews.filter(i => i.difficulty === 'Hard').length,
    },
  };

  if (interviews.filter(i => i.status === 'completed').length > 0) {
    const totalScore = interviews
      .filter(i => i.status === 'completed')
      .reduce((sum, i) => sum + i.score, 0);
    stats.averageScore = Math.round(totalScore / interviews.filter(i => i.status === 'completed').length);
  }

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * Get a specific question from interview
 */
exports.getQuestion = asyncHandler(async (req, res, next) => {
  const { interviewId, questionId } = req.params;

  const interview = await Interview.findById(interviewId);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found',
    });
  }

  if (interview.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this question',
    });
  }

  const question = await InterviewQuestion.findById(questionId);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found',
    });
  }

  // Check if response already exists for this question
  const response = await InterviewResponse.findOne({ interviewId, questionId });

  res.status(200).json({
    success: true,
    data: {
      question,
      response: response || null,
    },
  });
});

/**
 * Get interview results/feedback
 */
exports.getInterviewResults = asyncHandler(async (req, res, next) => {
  const { interviewId } = req.params;

  const interview = await Interview.findById(interviewId)
    .populate({
      path: 'responses',
      populate: {
        path: 'questionId',
        select: 'questionText category difficulty',
      },
    });

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found',
    });
  }

  if (interview.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these results',
    });
  }

  if (interview.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Interview is not completed yet',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      interview,
      responses: interview.responses,
      score: interview.score,
      feedback: interview.feedback,
    },
  });
});

/**
 * Delete interview
 */
exports.deleteInterview = asyncHandler(async (req, res, next) => {
  const { interviewId } = req.params;

  const interview = await Interview.findById(interviewId);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found',
    });
  }

  if (interview.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this interview',
    });
  }

  // Delete associated questions and responses
  await InterviewQuestion.deleteMany({ interviewId });
  await InterviewResponse.deleteMany({ interviewId });

  // Delete interview
  await Interview.findByIdAndDelete(interviewId);

  res.status(200).json({
    success: true,
    message: 'Interview deleted successfully',
  });
});
