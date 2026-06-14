const express = require('express');
const resumeController = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

// Protect all resume routes
router.use(protect);

// Upload and analyze resume
router.post('/upload', upload.single('resume'), resumeController.uploadResume);

// Get all resumes for user
router.get('/', resumeController.getUserResumes);

// Get resume statistics
router.get('/stats', resumeController.getResumeStats);

// Get resume by ID
router.get('/:id', resumeController.getResumeById);

// Get detailed analysis for resume
router.get('/:id/analysis', resumeController.getResumeAnalysis);

// Re-analyze resume
router.post('/:id/reanalyze', resumeController.reanalyzeResume);

// Set as default resume
router.patch('/:id/set-default', resumeController.setDefaultResume);

// Download resume
router.get('/:id/download', resumeController.downloadResume);

// Delete resume
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
