const mongoose = require('mongoose');

const codeExecutionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingChallenge',
      default: null,
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
    input: {
      type: String,
      trim: true,
      default: '',
    },
    output: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Accepted', 'Failed', 'Error'],
      default: 'Accepted',
    },
    executionTime: {
      type: Number,
      default: 0,
      description: 'Execution time in milliseconds',
    },
    memory: {
      type: Number,
      default: 0,
      description: 'Memory usage in MB',
    },
    challengeTitle: {
      type: String,
      default: 'Unknown Challenge',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
codeExecutionHistorySchema.index({ userId: 1, createdAt: -1 });
codeExecutionHistorySchema.index({ challengeId: 1, userId: 1 });

const CodeExecutionHistory = mongoose.model('CodeExecutionHistory', codeExecutionHistorySchema);

module.exports = CodeExecutionHistory;
