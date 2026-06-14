const path = require('path');
const Resume = require('../models/Resume');
const cloudinary = require('../config/cloudinary');
const aiService = require('../utils/aiService');
const { parseDocument, extractSections, parseAchievementStringBlock } = require('../utils/resumeParser');
const {
  calculateATSScore,
  analyzeKeywordMatch,
  analyzeRoleMatch,
  analyzeIndustryMatch,
  generateAIRecommendations,
  calculateOverallScore,
} = require('../utils/atsAnalyzer');
const asyncHandler = require('../utils/asyncHandler');

const normalizeAchievementItem = (item) => {
  if (!item) return null;
  if (typeof item === 'string') {
    const textMatch = item.match(/text:\s*['"]([^'"]+)['"]/i);
    const typeMatch = item.match(/type:\s*['"]([^'"]+)['"]/i);
    const strengthMatch = item.match(/strength:\s*['"]([^'"]+)['"]/i);
    if (textMatch) {
      return {
        text: textMatch[1].trim(),
        type: typeMatch?.[1]?.trim() || 'Achievement',
        strength: strengthMatch?.[1]?.trim() || 'Strong Achievement',
      };
    }
    return {
      text: item.trim(),
      type: 'Achievement',
      strength: 'Strong Achievement',
    };
  }

  return {
    text: typeof item.text === 'string' ? item.text.trim() : String(item.text || '').trim(),
    type: typeof item.type === 'string' ? item.type.trim() : 'Achievement',
    strength: typeof item.strength === 'string' ? item.strength.trim() : 'Strong Achievement',
  };
};

const sanitizeAchievements = (achievements) => {
  if (achievements == null) return [];
  if (typeof achievements === 'string') achievements = [achievements];
  if (!Array.isArray(achievements)) return [];

  return achievements
    .flatMap((item) => {
      if (item == null) return [];
      if (typeof item === 'string') {
        const parsedItems = typeof parseAchievementStringBlock === 'function' ? parseAchievementStringBlock(item) : [];
        if (parsedItems.length > 0) {
          return parsedItems;
        }
        const normalized = normalizeAchievementItem(item);
        return normalized ? [normalized] : [];
      }
      if (typeof item === 'object') {
        const normalized = normalizeAchievementItem(item);
        return normalized ? [normalized] : [];
      }
      return [];
    })
    .filter((achievement) => achievement && achievement.text)
    .map((achievement) => ({
      text: achievement.text,
      type: achievement.type,
      strength: achievement.strength,
    }));
};

const sanitizeLinks = (links = {}) => ({
  linkedIn: links.linkedIn || '',
  github: links.github || '',
  portfolio: links.portfolio || '',
  projectUrls: Array.isArray(links.projectUrls) ? links.projectUrls : [],
  otherUrls: Array.isArray(links.otherUrls) ? links.otherUrls : [],
});

const normalizeParsedSections = (sections = {}) => ({
  ...sections,
  achievements: sanitizeAchievements(sections.achievements),
  links: sanitizeLinks(sections.links),
});

// Upload and analyze resume
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const fileType = path.extname(req.file.originalname).slice(1).toLowerCase();
    const uploadOptions = {
      resource_type: 'raw',
      folder: `resume-analyzer/${req.user._id}`,
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`,
    };
    if (fileType === 'pdf' || fileType === 'docx' || fileType === 'doc') {
      uploadOptions.format = fileType === 'pdf' ? 'pdf' : fileType;
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });

      uploadStream.end(req.file.buffer);
    });

    // Create resume document in DB
    let resume = new Resume({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileType,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      fileSizeKB: Math.round(req.file.size / 1024),
      status: 'processing',
    });

    await resume.save();

// Parse document and analyze
      try {
        const { fullText } = await parseDocument(req.file.buffer, fileType);

        // Debug: ensure parsed text exists before analysis
        console.log('--- DOCUMENT PARSE CHECK ---');
        console.log('RAW TEXT (first 1000 chars):');
      console.log(typeof fullText === 'string' ? fullText.slice(0, 1000) : String(fullText));
      console.log('TEXT LENGTH');
      console.log(String(fullText).length);

      // Extract sections from parsed content
      const rawSections = extractSections(fullText);
      console.log('RAW SECTIONS KEYS:', Object.keys(rawSections.rawSections || {}));
      console.log('VALIDATED FLAGS:', rawSections.validated || {});
      const sections = normalizeParsedSections(rawSections.sections || rawSections);

      // Verify sections before AI processing
      if (!fullText || !String(fullText).trim() || Object.keys(rawSections.sections || {}).length === 0) {
        console.error('Empty or missing parsed text - aborting analysis');
        resume.status = 'failed';
        resume.processingError = 'Parsed resume text empty - cannot analyze';
        await resume.save();
        return res.status(422).json({ success: false, message: 'Parsed resume text empty - cannot analyze' });
      }

      // Get extracted skills
      const extractedSkills = [];
      if (sections.skills && sections.skills.length > 0) {
        sections.skills.forEach((skillCategory) => {
          if (skillCategory.items && skillCategory.items.length > 0) {
            skillCategory.items.forEach((item) => {
              extractedSkills.push({
                skill: item,
                category: skillCategory.category,
                frequency: 1,
                relevance: 'high',
              });
            });
          }
        });
      }

      const roleMatch = analyzeRoleMatch(extractedSkills, {
        fullText,
        sections,
      });
      const atsScore = calculateATSScore({ fullText, sections }, extractedSkills, roleMatch);
      const keywordAnalysis = analyzeKeywordMatch(extractedSkills, roleMatch);
      const industryMatch = analyzeIndustryMatch(extractedSkills, {
        fullText,
        sections,
      });
      industryMatch.recommendedRoles = roleMatch.slice(0, 5);
      const fallbackFeedback = generateAIRecommendations(
        { fullText, sections },
        atsScore,
        keywordAnalysis,
        roleMatch
      );
      const aiInsights = await aiService.generateResumeInsights(
        { fullText, sections },
        extractedSkills,
        roleMatch,
        keywordAnalysis,
        atsScore,
        industryMatch
      );
      const aiFeedback = {
        ...fallbackFeedback,
        ...aiInsights,
        strengths: aiInsights?.strengths?.length ? aiInsights.strengths : fallbackFeedback.strengths,
        weaknesses: aiInsights?.weaknesses?.length ? aiInsights.weaknesses : fallbackFeedback.weaknesses,
        recommendations:
          aiInsights?.recommendations?.length > 0
            ? aiInsights.recommendations
            : fallbackFeedback.recommendations,
        actionPlan:
          aiInsights?.actionPlan?.length > 0
            ? aiInsights.actionPlan
            : fallbackFeedback.actionPlan,
      };
      const overallScore = calculateOverallScore(atsScore, extractedSkills, {
        fullText,
        sections,
      }, roleMatch);

      // Update resume with analysis
      resume.parsedContent = {
        fullText,
        sections,
      };

      resume.analysis = {
        extractedSkills,
        skillCategories: sections.skills,
        atsScore,
        keywordAnalysis,
        roleMatch,
        industryMatch,
        linkAnalysis: {
          github: Boolean(sections.links.github),
          linkedIn: Boolean(sections.links.linkedIn),
          portfolio: Boolean(sections.links.portfolio),
          projectUrls: sections.links.projectUrls || [],
          missing: [
            ...(sections.links.github ? [] : ['GitHub']),
            ...(sections.links.linkedIn ? [] : ['LinkedIn']),
            ...(sections.links.portfolio ? [] : ['Portfolio']),
          ],
          recommendations: [
            ...(!sections.links.github ? ['Add GitHub link if applicable'] : []),
            ...(!sections.links.linkedIn ? ['Include LinkedIn profile'] : []),
            ...(!sections.links.portfolio ? ['Add portfolio or project site'] : []),
          ],
        },
        aiFeedback,
        overallScore,
      };

        // Debug: ensure analysis fields are present and not overwritten
        try {
          console.log('--- ANALYSIS SUMMARY ---');
          console.log('extractedSkills count:', extractedSkills.length);
          console.log('projects count:', (sections.projects || []).length);
          console.log('education count:', (sections.education || []).length);
          console.log('experience count:', (sections.experience || []).length);
        } catch (e) {
          console.warn('Failed to log analysis summary', e.message);
        }

      resume.status = 'completed';
      resume.analysisGeneratedAt = new Date();

      await resume.save();

      res.status(201).json({
        success: true,
        message: 'Resume uploaded and analyzed successfully',
        resume: resume,
      });
    } catch (analysisError) {
      console.error('Resume analysis error:', analysisError);

      resume.status = 'failed';
      resume.processingError = analysisError.message;
      await resume.save();

      res.status(400).json({
        success: false,
        message: 'File uploaded but analysis failed',
        error: analysisError.message,
      });
    }
  } catch (uploadError) {
    console.error('Upload error:', uploadError);
    res.status(400).json({
      success: false,
      message: 'Failed to upload resume',
      error: uploadError.message,
    });
  }
});

// Get all resumes for user
exports.getUserResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id })
    .select(
      'fileName uploadDate status analysisGeneratedAt analysis.overallScore analysis.atsScore cloudinaryUrl'
    )
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: resumes.length,
    resumes,
  });
});

// Get resume by ID
exports.getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  // Check authorization
  if (resume.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to access this resume' });
  }

  res.status(200).json({
    success: true,
    resume,
  });
});

// Delete resume
exports.deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  // Check authorization
  if (resume.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this resume' });
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(resume.cloudinaryPublicId, {
      type: 'upload',
      resource_type: 'raw',
    });
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
  }

  // Delete from database
  await Resume.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Resume deleted successfully',
  });
});

// Set as default resume
exports.setDefaultResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  // Check authorization
  if (resume.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to modify this resume' });
  }

  // Remove default from all other resumes
  await Resume.updateMany(
    { userId: req.user._id, _id: { $ne: req.params.id } },
    { isDefault: false }
  );

  // Set this as default
  resume.isDefault = true;
  await resume.save();

  res.status(200).json({
    success: true,
    message: 'Resume set as default',
    resume,
  });
});

// Get analysis for resume
exports.getResumeAnalysis = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id).select('analysis parsedContent userId');

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  // Check authorization
  if (resume.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to access this resume' });
  }

  res.status(200).json({
    success: true,
    analysis: resume.analysis,
    parsedContent: resume.parsedContent,
  });
});

// Update resume analysis (for re-analysis)
exports.reanalyzeResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  // Check authorization
  if (resume.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to modify this resume' });
  }

  try {
    resume.status = 'processing';
    await resume.save();

    // Download resume from Cloudinary and parse
    const fetch = (await import('node-fetch')).default;
    const resumeBuffer = await fetch(resume.cloudinaryUrl).then((res) => res.buffer());
    const fileType = resume.fileType || path.extname(resume.fileName).slice(1).toLowerCase() || 'pdf';

    const { fullText } = await parseDocument(resumeBuffer, fileType);
    const rawSections = extractSections(fullText);
    const sections = normalizeParsedSections(rawSections);

    const extractedSkills = [];
    if (sections.skills && sections.skills.length > 0) {
      sections.skills.forEach((skillCategory) => {
        if (skillCategory.items && skillCategory.items.length > 0) {
          skillCategory.items.forEach((item) => {
            extractedSkills.push({
              skill: item,
              category: skillCategory.category,
              frequency: 1,
              relevance: 'medium',
            });
          });
        }
      });
    }

    const roleMatch = analyzeRoleMatch(extractedSkills, { fullText, sections });
    const atsScore = calculateATSScore({ fullText, sections }, extractedSkills, roleMatch);
    const keywordAnalysis = analyzeKeywordMatch(extractedSkills, roleMatch);
    const industryMatch = analyzeIndustryMatch(extractedSkills, { fullText, sections });
    industryMatch.recommendedRoles = roleMatch.slice(0, 5);
    const fallbackFeedback = generateAIRecommendations(
      { fullText, sections },
      atsScore,
      keywordAnalysis,
      roleMatch
    );
    const aiInsights = await aiService.generateResumeInsights(
      { fullText, sections },
      extractedSkills,
      roleMatch,
      keywordAnalysis,
      atsScore,
      industryMatch
    );
    const aiFeedback = {
      ...fallbackFeedback,
      ...aiInsights,
      strengths: aiInsights?.strengths?.length ? aiInsights.strengths : fallbackFeedback.strengths,
      weaknesses: aiInsights?.weaknesses?.length ? aiInsights.weaknesses : fallbackFeedback.weaknesses,
      recommendations:
        aiInsights?.recommendations?.length > 0
          ? aiInsights.recommendations
          : fallbackFeedback.recommendations,
      actionPlan:
        aiInsights?.actionPlan?.length > 0
          ? aiInsights.actionPlan
          : fallbackFeedback.actionPlan,
    };
    const overallScore = calculateOverallScore(atsScore, extractedSkills, { fullText, sections }, roleMatch);

    resume.parsedContent = { fullText, sections };
    resume.analysis = {
      extractedSkills,
      skillCategories: sections.skills,
      atsScore,
      keywordAnalysis,
      roleMatch,
      industryMatch,
      linkAnalysis: {
        github: Boolean(sections.links.github),
        linkedIn: Boolean(sections.links.linkedIn),
        portfolio: Boolean(sections.links.portfolio),
        projectUrls: sections.links.projectUrls || [],
        missing: [
          ...(sections.links.github ? [] : ['GitHub']),
          ...(sections.links.linkedIn ? [] : ['LinkedIn']),
          ...(sections.links.portfolio ? [] : ['Portfolio']),
        ],
        recommendations: [
          ...(!sections.links.github ? ['Add GitHub link if applicable'] : []),
          ...(!sections.links.linkedIn ? ['Include LinkedIn profile'] : []),
          ...(!sections.links.portfolio ? ['Add portfolio or project site'] : []),
        ],
      },
      aiFeedback,
      overallScore,
    };
    resume.status = 'completed';
    resume.analysisGeneratedAt = new Date();

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume re-analyzed successfully',
      resume,
    });
  } catch (error) {
    console.error('Re-analysis error:', error);
    resume.status = 'failed';
    resume.processingError = error.message;
    await resume.save();

    res.status(400).json({
      success: false,
      message: 'Failed to re-analyze resume',
      error: error.message,
    });
  }
});

// Get resume download URL
exports.downloadResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id).select('cloudinaryUrl userId');

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  // Check authorization
  if (resume.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to access this resume' });
  }

  res.status(200).json({
    success: true,
    downloadUrl: resume.cloudinaryUrl,
  });
});

// Get resume statistics for user
exports.getResumeStats = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id });

  const stats = {
    totalResumes: resumes.length,
    averageATSScore:
      resumes.length > 0
        ? Math.round(
            resumes.reduce((sum, r) => sum + (r.analysis?.atsScore?.score || 0), 0) / resumes.length
          )
        : 0,
    averageOverallScore:
      resumes.length > 0
        ? Math.round(
            resumes.reduce((sum, r) => sum + (r.analysis?.overallScore?.score || 0), 0) /
              resumes.length
          )
        : 0,
    lastResumeDate: resumes.length > 0 ? resumes[0].uploadDate : null,
    completedResumes: resumes.filter((r) => r.status === 'completed').length,
    failedResumes: resumes.filter((r) => r.status === 'failed').length,
  };

  res.status(200).json({
    success: true,
    stats,
  });
});
