// AI Service Index - exports all AI-related services
module.exports = {
  // Resume Analyzer
  resumeParser: require('./resumeParser'),
  
  // Interview Generator & Feedback (from utils/aiService.js)
  aiService: require('../../../utils/aiService'),
};
