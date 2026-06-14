/**
 * Resume Service
 * Handles resume management, analysis, and ATS scoring
 */

const Resume = require('../../models/Resume');
const { resumeParser } = require('../ai');
const { atsAnalyzer } = require('../../utils/atsAnalyzer');

const resumeService = {
  /**
   * Upload and parse a resume
   * @param {string} userId - User ID
   * @param {Object} file - Uploaded file
   * @returns {Promise<Object>} Parsed resume data
   */
  uploadResume: async (userId, file) => {
    try {
      // Parse resume using AI service
      const parsedData = await resumeParser.parseResume(file);

      // Analyze ATS score
      const atsScore = await atsAnalyzer.calculateATSScore(parsedData);

      // Save to database
      const resume = new Resume({
        userId,
        fileName: file.originalname,
        fileUrl: file.path,
        parsedData,
        atsScore,
      });

      await resume.save();
      return resume;
    } catch (error) {
      throw new Error(`Error uploading resume: ${error.message}`);
    }
  },

  /**
   * Get user's resume
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Resume data
   */
  getUserResume: async (userId) => {
    try {
      const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
      return resume;
    } catch (error) {
      throw new Error(`Error fetching resume: ${error.message}`);
    }
  },

  /**
   * Get resume analysis
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Analysis results
   */
  getResumeAnalysis: async (userId) => {
    try {
      const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

      if (!resume) {
        throw new Error('No resume found');
      }

      const analysis = {
        atsScore: resume.atsScore,
        strengths: [],
        weaknesses: [],
        suggestions: [],
        skills: resume.parsedData.skills || [],
        experience: resume.parsedData.experience || [],
        education: resume.parsedData.education || [],
      };

      // Generate suggestions based on ATS score
      if (resume.atsScore < 50) {
        analysis.suggestions.push('Add more relevant keywords');
        analysis.suggestions.push('Include quantifiable achievements');
      }

      if (resume.atsScore < 70) {
        analysis.suggestions.push('Improve formatting for better parsing');
        analysis.suggestions.push('Add more industry-specific terms');
      }

      if (resume.atsScore >= 80) {
        analysis.strengths.push('Good ATS score');
        analysis.strengths.push('Well-structured content');
      }

      return analysis;
    } catch (error) {
      throw new Error(`Error analyzing resume: ${error.message}`);
    }
  },

  /**
   * Update resume
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated resume
   */
  updateResume: async (userId, updateData) => {
    try {
      const resume = await Resume.findOneAndUpdate({ userId }, updateData, { new: true });
      return resume;
    } catch (error) {
      throw new Error(`Error updating resume: ${error.message}`);
    }
  },

  /**
   * Delete resume
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  deleteResume: async (userId) => {
    try {
      await Resume.findOneAndDelete({ userId });
      return true;
    } catch (error) {
      throw new Error(`Error deleting resume: ${error.message}`);
    }
  },

  /**
   * Get ATS score breakdown
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Detailed ATS breakdown
   */
  getATSBreakdown: async (userId) => {
    try {
      const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

      if (!resume) {
        throw new Error('No resume found');
      }

      return {
        overallScore: resume.atsScore,
        breakdown: {
          formatting: resume.atsScore * 0.25,
          keywords: resume.atsScore * 0.35,
          structure: resume.atsScore * 0.25,
          content: resume.atsScore * 0.15,
        },
        missingKeywords: identifyMissingKeywords(resume.parsedData),
        recommendations: generateRecommendations(resume.atsScore),
      };
    } catch (error) {
      throw new Error(`Error getting ATS breakdown: ${error.message}`);
    }
  },
};

/**
 * Helper function to identify missing keywords
 */
function identifyMissingKeywords(parsedData) {
  const commonKeywords = [
    'leadership',
    'communication',
    'problem-solving',
    'teamwork',
    'project management',
  ];
  const resumeText = JSON.stringify(parsedData).toLowerCase();
  return commonKeywords.filter((keyword) => !resumeText.includes(keyword));
}

/**
 * Helper function to generate recommendations
 */
function generateRecommendations(score) {
  if (score < 50) {
    return [
      'Major formatting issues detected',
      'Add more specific job titles',
      'Include quantifiable metrics',
    ];
  }
  if (score < 70) {
    return ['Minor formatting improvements', 'Add more industry keywords', 'Strengthen achievements'];
  }
  return ['Well-formatted resume', 'Good keyword coverage'];
}

module.exports = resumeService;
