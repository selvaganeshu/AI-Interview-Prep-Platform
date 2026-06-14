const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: [true, 'Interview ID is required'],
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty level is required'],
    },
    interviewType: {
      type: String,
      enum: ['technical', 'hr', 'behavioral'],
      required: [true, 'Interview type is required'],
    },
    expectedAnswer: {
      type: String,
      trim: true,
    },
    hints: [String],
    tags: [String],
    orderNumber: {
      type: Number,
      required: true,
    },
    generatedByAI: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

module.exports = InterviewQuestion;
