/**
 * Backend Constants
 * Centralized constants used throughout the application
 */

module.exports = {
  // User Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
  },

  // Interview Types
  INTERVIEW_TYPES: {
    TECHNICAL: 'technical',
    BEHAVIORAL: 'behavioral',
    HR: 'hr',
    MOCK: 'mock',
  },

  // Difficulty Levels
  DIFFICULTY_LEVELS: {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
    EXPERT: 'Expert',
  },

  // Programming Languages
  LANGUAGES: {
    JAVASCRIPT: 'JavaScript',
    PYTHON: 'Python',
    JAVA: 'Java',
    CPP: 'C++',
    CSHARP: 'C#',
    GO: 'Go',
    RUST: 'Rust',
    TYPESCRIPT: 'TypeScript',
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Cache Expiry Times (in seconds)
  CACHE_EXPIRY: {
    VERY_SHORT: 60, // 1 minute
    SHORT: 300, // 5 minutes
    MEDIUM: 3600, // 1 hour
    LONG: 86400, // 1 day
    VERY_LONG: 604800, // 1 week
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // File Upload Limits
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['application/pdf', 'application/msword', 'text/plain'],
  },

  // Email Templates
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password-reset',
    VERIFICATION: 'email-verification',
    SUBMISSION_CONFIRMATION: 'submission-confirmation',
  },

  // Submission Status
  SUBMISSION_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    RUNTIME_ERROR: 'runtime-error',
    COMPILATION_ERROR: 'compilation-error',
    TIME_LIMIT_EXCEEDED: 'time-limit-exceeded',
  },

  // User Levels
  USER_LEVELS: {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
    EXPERT: 'Expert',
  },

  // Error Messages
  ERRORS: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_ALREADY_EXISTS: 'Email already registered',
    UNAUTHORIZED_ACCESS: 'You do not have permission to access this resource',
    SERVER_ERROR: 'An error occurred on the server',
    VALIDATION_ERROR: 'Validation failed',
    MISSING_FIELDS: 'Missing required fields',
  },

  // Success Messages
  SUCCESS: {
    CREATED: 'Successfully created',
    UPDATED: 'Successfully updated',
    DELETED: 'Successfully deleted',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
  },

  // JWT Configuration
  JWT: {
    EXPIRY: '7d',
    REFRESH_EXPIRY: '30d',
    ALGORITHM: 'HS256',
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },

  // Code Execution
  CODE_EXECUTION: {
    TIMEOUT: 5000, // 5 seconds
    MEMORY_LIMIT: 256, // MB
    MAX_OUTPUT_LENGTH: 10000, // characters
  },

  // ATS Score Thresholds
  ATS_THRESHOLDS: {
    EXCELLENT: 80,
    GOOD: 70,
    AVERAGE: 50,
    POOR: 0,
  },
};
