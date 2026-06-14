const mongoose = require('mongoose');

const interviewResponseSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: [true, 'Interview ID is required'],
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewQuestion',
      required: [true, 'Question ID is required'],
    },
    userAnswer: {
      type: String,
      required: [true, 'User answer is required'],
      trim: true,
    },
    aiEvaluation: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      feedback: {
        type: String,
        trim: true,
      },
      strengths: [String],
      areasForImprovement: [String],
      suggestions: [String],
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    answered: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const InterviewResponse = mongoose.model('InterviewResponse', interviewResponseSchema);

module.exports = InterviewResponse;
