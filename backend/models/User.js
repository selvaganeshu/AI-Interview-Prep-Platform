const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profileImage: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    college: {
      type: String,
      default: null,
    },
    degree: {
      type: String,
      default: null,
    },
    graduationYear: {
      type: Number,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    github: {
      type: String,
      default: null,
    },
    linkedin: {
      type: String,
      default: null,
    },
    portfolio: {
      type: String,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    resumeScore: {
      type: Number,
      default: null,
    },
    resumeAnalyzedAt: {
      type: Date,
      default: null,
    },
    codingSolved: {
      type: Number,
      default: 0,
    },
    interviewsCompleted: {
      type: Number,
      default: 0,
    },
    avgInterviewScore: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    tempPassword: String,
    tempPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
