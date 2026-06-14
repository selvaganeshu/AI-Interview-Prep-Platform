/**
 * Services Index
 * Central export point for all backend services
 */

const aiServices = require('./ai');
const codingServices = require('./coding');
const emailServices = require('./email');
const analyticsServices = require('./analytics');
const resumeServices = require('./resume');

// Import existing services
const dashboardService = require('./dashboardService');
const profileService = require('./profileService');

module.exports = {
  // AI Services
  resumeParser: aiServices.resumeParser,

  // Coding Services
  codeExecutionService: codingServices.codeExecutionService,

  // Email Services
  emailService: emailServices.emailService,

  // Analytics Services
  analyticsService: analyticsServices.analyticsService,

  // Resume Services
  resumeService: resumeServices.resumeService,

  // Existing Services
  dashboardService,
  profileService,
};
