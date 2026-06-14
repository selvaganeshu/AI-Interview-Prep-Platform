const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    text: String,
    type: String,
    strength: String,
  },
  { _id: false }
);

const normalizeAchievementItem = (item) => {
  if (!item) return null;
  if (typeof item === 'string') {
    const textMatch = item.match(/text\s*[:=]\s*['"]([^'\"]+)['"]/i);
    const typeMatch = item.match(/type\s*[:=]\s*['"]([^'\"]+)['"]/i);
    const strengthMatch = item.match(/strength\s*[:=]\s*['"]([^'\"]+)['"]/i);

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

  if (typeof item === 'object') {
    return {
      text: typeof item.text === 'string' ? item.text.trim() : String(item.text || '').trim(),
      type: typeof item.type === 'string' ? item.type.trim() : 'Achievement',
      strength: typeof item.strength === 'string' ? item.strength.trim() : 'Strong Achievement',
    };
  }

  return null;
};

const normalizeAchievements = (achievements) => {
  if (achievements == null) return [];
  if (typeof achievements === 'string') achievements = [achievements];
  if (!Array.isArray(achievements)) return [];

  return achievements
    .flatMap((item) => {
      if (item == null) return [];
      const normalized = normalizeAchievementItem(item);
      return normalized && normalized.text ? [normalized] : [];
    })
    .filter(Boolean);
};

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'docx', 'doc'],
      default: 'pdf',
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    fileSizeKB: {
      type: Number,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    // Parsed content
    parsedContent: {
      fullText: String,
      sections: {
        personalInfo: {
          name: String,
          email: String,
          phone: String,
          location: String,
          linkedIn: String,
          portfolio: String,
        },
        summary: String,
        experience: [
          {
            jobTitle: String,
            company: String,
            duration: String,
            startDate: String,
            endDate: String,
            description: String,
            responsibilities: [String],
          },
        ],
        education: [
          {
            degree: String,
            field: String,
            school: String,
            graduationYear: String,
            gpa: String,
          },
        ],
        skills: [
          {
            category: String,
            items: [String],
          },
        ],
        certifications: [
          {
            name: String,
            issuer: String,
            date: String,
            credentialId: String,
          },
        ],
        projects: [
          {
            name: String,
            description: String,
            technologies: [String],
            complexity: String,
            domain: String,
            link: String,
          },
        ],
        achievements: {
          type: [achievementSchema],
          set: normalizeAchievements,
        },
        links: {
          linkedIn: String,
          github: String,
          portfolio: String,
          projectUrls: [String],
          otherUrls: [String],
        },
      },
    },

    // Analysis Results
    analysis: {
      extractedSkills: [
        {
          skill: String,
          category: String, // Technical, Soft, Leadership, etc.
          frequency: Number,
          relevance: String, // high, medium, low
        },
      ],
      skillCategories: [
        {
          category: String,
          items: [String],
        },
      ],
      atsScore: {
        score: Number, // 0-100
        strengths: [String],
        weaknesses: [String],
        missingKeywords: [String],
        recommendations: [String],
      },
      keywordAnalysis: {
        presentKeywords: [String],
        missingKeywords: [String],
        recommendedKeywords: [String],
      },
      roleMatch: [
        {
          role: String,
          matchScore: Number,
          explanation: String,
        },
      ],
      industryMatch: {
        industries: [
          {
            industry: String,
            matchScore: Number, // 0-100
          },
        ],
        recommendedRoles: [
          {
            role: String,
            matchScore: Number,
            explanation: String,
          },
        ],
      },
      linkAnalysis: {
        github: Boolean,
        linkedIn: Boolean,
        portfolio: Boolean,
        projectUrls: [String],
        missing: [String],
        recommendations: [String],
      },
      aiFeedback: {
        strengths: [String],
        weaknesses: [String],
        recommendations: [String],
        actionPlan: [String],
      },
      overallScore: {
        score: Number, // 0-100
        grade: String, // A, B, C, D, F
        summary: String,
      },
    },

    // Metadata
    status: {
      type: String,
      enum: ['uploading', 'processing', 'completed', 'failed'],
      default: 'uploading',
    },
    processingError: String,
    analysisGeneratedAt: Date,
    lastModifiedAt: {
      type: Date,
      default: Date.now,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for frequent queries
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, isDefault: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
