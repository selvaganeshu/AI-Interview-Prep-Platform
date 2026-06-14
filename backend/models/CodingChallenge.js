const mongoose = require('mongoose');

const starterCodeSchema = new mongoose.Schema(
  {
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
    java: { type: String, default: '' },
    cpp: { type: String, default: '' },
    c: { type: String, default: '' },
    typescript: { type: String, default: '' },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true, trim: true },
    expectedOutput: { type: String, required: true, trim: true },
    hidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const codingChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty level is required'],
    },
    categories: [{ type: String, trim: true }],
    languageOptions: {
      type: [String],
      default: ['javascript', 'python', 'java'],
    },
    defaultLanguage: {
      type: String,
      default: 'javascript',
    },
    starterCode: {
      type: starterCodeSchema,
      default: () => ({}),
    },
    timeLimit: {
      type: Number,
      default: 20,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    testCases: {
      type: [testCaseSchema],
      default: [],
    },
    tags: [{ type: String, trim: true }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const CodingChallenge = mongoose.model('CodingChallenge', codingChallengeSchema);

module.exports = CodingChallenge;
