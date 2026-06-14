const mongoose = require('mongoose');

const codingSubmissionSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingChallenge',
      required: [true, 'Challenge ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    sourceCode: {
      type: String,
      required: [true, 'Source code is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    passedCases: {
      type: Number,
      default: 0,
    },
    totalCases: {
      type: Number,
      default: 0,
    },
    output: {
      type: String,
      trim: true,
      default: '',
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    testCaseResults: {
      type: [
        {
          input: String,
          expectedOutput: String,
          actualOutput: String,
          status: {
            type: String,
            enum: ['passed', 'failed'],
          },
          isHidden: Boolean,
        },
      ],
      default: [],
    },
    aiFeedback: {
      scoreSummary: { type: String, default: '' },
      feedback: { type: String, default: '' },
      strengths: { type: [String], default: [] },
      improvements: { type: [String], default: [] },
      suggestions: { type: [String], default: [] },
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
    executionSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const CodingSubmission = mongoose.model('CodingSubmission', codingSubmissionSchema);

module.exports = CodingSubmission;
