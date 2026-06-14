const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Interview title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ['technical', 'hr', 'behavioral'],
      required: [true, 'Interview type is required'],
    },
    categories: [{
      type: String,
      enum: [
        'JavaScript',
        'React',
        'Node.js',
        'MongoDB',
        'Full Stack',
        'System Design',
        'Algorithms',
        'Data Structures',
        'Communication',
        'Problem Solving',
        'Leadership',
        'Teamwork',
      ],
    }],
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty level is required'],
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
      trim: true,
    },
    startTime: Date,
    endTime: Date,
    completedAt: Date,
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewQuestion',
    }],
    responses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewResponse',
    }],
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
