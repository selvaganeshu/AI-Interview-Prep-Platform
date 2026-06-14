const { allKnownSkills } = require('./resumeParser');

const roleProfiles = [
  {
    role: 'MERN Developer',
    keywords: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'TypeScript', 'REST API'],
    explanation: 'Strong fit for a modern MERN stack role',
  },
  {
    role: 'Frontend Developer',
    keywords: ['React', 'Angular', 'Vue', 'HTML', 'CSS', 'JavaScript', 'TypeScript'],
    explanation: 'Focused on frontend frameworks and modern UI development',
  },
  {
    role: 'Backend Developer',
    keywords: ['Node.js', 'Express.js', 'Spring Boot', 'Django', 'REST API', 'GraphQL', 'Database'],
    explanation: 'Backend expertise with APIs and service architecture',
  },
  {
    role: 'Java Developer',
    keywords: ['Java', 'Spring Boot', 'Hibernate', 'Maven', 'Gradle', 'JUnit'],
    explanation: 'Java ecosystem experience with enterprise backends',
  },
  {
    role: 'AI Engineer',
    keywords: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'NLP', 'OpenAI API', 'Data Science'],
    explanation: 'AI engineering with machine learning and model integration',
  },
];

const industryProfiles = [
  {
    name: 'Software Development',
    keywords: ['JavaScript', 'Java', 'Python', 'React', 'Node.js', 'API', 'Database'],
  },
  {
    name: 'Full Stack Development',
    keywords: ['React', 'Node.js', 'Express.js', 'MongoDB', 'TypeScript', 'REST API'],
  },
  {
    name: 'Frontend Development',
    keywords: ['HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Vue'],
  },
  {
    name: 'Backend Development',
    keywords: ['Node.js', 'Java', 'Spring Boot', 'Django', 'SQL', 'API'],
  },
  {
    name: 'Artificial Intelligence',
    keywords: ['Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'NLP', 'Data Science'],
  },
];

const normalize = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[.+]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const buildSkillSet = (extractedSkills = []) =>
  new Set(extractedSkills.map((item) => normalize(item.skill)));

const analyzeKeywordMatch = (extractedSkills = [], roleMatch = []) => {
  const presentKeywords = Array.from(new Set(extractedSkills.map((skill) => skill.skill))).sort();
  const presentSet = buildSkillSet(extractedSkills);

  const topRole = roleMatch?.[0];
  const roleProfile = roleProfiles.find((profile) => profile.role === topRole?.role);
  const roleKeywords = roleProfile?.keywords || allKnownSkills;

  const missingKeywords = roleKeywords
    .filter((keyword) => !presentSet.has(normalize(keyword)))
    .slice(0, 12);

  const recommendedKeywords = missingKeywords.slice(0, 8);

  return {
    presentKeywords,
    missingKeywords,
    recommendedKeywords,
    roleFocus: roleProfile?.role || 'General',
  };
};

const calculateATSScore = (parsedContent = {}, extractedSkills = [], roleMatch = []) => {
  const sections = parsedContent.sections || {};
  // Debug logging for ATS pipeline
  try {
    console.log('--- ATS Pipeline Input ---');
    console.log('Sections keys:', Object.keys(sections));
    console.log('Skills count:', extractedSkills.length);
    console.log('Role match top:', roleMatch?.[0]?.role || 'none');
  } catch (e) {
    console.warn('ATS logging failed', e.message);
  }
  let score = 0;
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  const hasEmail = Boolean(sections.personalInfo?.email);
  const hasPhone = Boolean(sections.personalInfo?.phone);
  const contactScore = hasEmail && hasPhone ? 10 : hasEmail || hasPhone ? 5 : 0;
  score += contactScore;
  if (contactScore === 10) {
    strengths.push('Complete contact information provided');
  } else {
    weaknesses.push('Missing full contact information');
    recommendations.push('Include both email and phone number at the top of your resume');
  }

  const educationScore = sections.education?.length > 0 ? 15 : 0;
  score += educationScore;
  if (educationScore) {
    strengths.push('Education details are present');
    if (sections.education.some((edu) => edu.gpa || edu.graduationYear || edu.school)) {
      strengths.push('Education includes GPA, graduation year, or institution details');
    }
  } else {
    weaknesses.push('Education section not detected');
    recommendations.push('Add degree, institution, and graduation date');
  }

  const skillsCount = sections.skills?.reduce((sum, category) => sum + (category.items?.length || 0), 0) || 0;
  const skillsScore = Math.min(20, skillsCount * 3);
  score += skillsScore;
  if (skillsCount >= 8) strengths.push('Strong technology coverage');
  else if (skillsCount > 0) weaknesses.push('Skill list is limited');
  else {
    weaknesses.push('No skills detected');
    recommendations.push('List relevant programming languages and frameworks clearly');
  }

  const projectCount = sections.projects?.length || 0;
  const projectTechCount = sections.projects?.reduce(
    (sum, project) => sum + (project.technologies?.length || 0),
    0
  ) || 0;
  const projectsScore = projectCount === 0 ? 0 : Math.min(25, Math.round(12 + Math.min(13, projectCount * 6 + projectTechCount)));
  score += projectsScore;
  if (projectCount >= 2) strengths.push('Multiple projects documented');
  else if (projectCount === 1) {
    strengths.push('One project is documented');
    weaknesses.push('More than one project would strengthen the resume');
  } else {
    weaknesses.push('No projects found');
    recommendations.push('Add projects with technologies, impact, and metrics');
  }

  const experienceScore = sections.experience?.length > 0 ? 15 : 0;
  score += experienceScore;
  if (experienceScore) strengths.push('Experience section is present');
  else {
    weaknesses.push('Experience section missing');
    recommendations.push('Add roles, companies, and durations');
  }

  const achievementCount = sections.achievements?.length || 0;
  const achievementsScore = Math.min(10, achievementCount * 3);
  score += achievementsScore;
  if (achievementCount > 0) strengths.push('Achievements are detected');
  else {
    weaknesses.push('No achievements detected');
    recommendations.push('Add awards, research, certifications, or coding accomplishments');
  }

  const hasGitHub = Boolean(sections.links?.github);
  const hasLinkedIn = Boolean(sections.links?.linkedIn);
  const hasPortfolio = Boolean(sections.links?.portfolio);
  const linksScore = Math.min(5, (hasGitHub ? 3 : 0) + (hasLinkedIn ? 3 : 0) + (hasPortfolio ? 1 : 0));
  score += linksScore;
  if (hasGitHub && hasLinkedIn) strengths.push('GitHub and LinkedIn links are provided');
  else if (hasGitHub || hasLinkedIn) weaknesses.push('One of the key profile links is missing');
  else {
    weaknesses.push('No GitHub or LinkedIn link detected');
    recommendations.push('Include GitHub and LinkedIn links if available');
  }

  const metricsFound = Boolean(parsedContent.fullText?.match(/\b(\d+%|\d+x|\$\d+[KM]?|\d+\s+(users|customers|clients|revenue|growth))\b/i));
  if (!metricsFound) {
    weaknesses.push('No quantified metrics found');
    recommendations.push('Add numbers and percentages to demonstrate impact');
  }

  const keywordAnalysis = analyzeKeywordMatch(extractedSkills, roleMatch);
  if (keywordAnalysis.presentKeywords.length >= 6) {
    strengths.push('Good keyword alignment');
  } else {
    weaknesses.push('Keyword coverage can improve');
    recommendations.push('Include more role-relevant skills and terms');
  }

  score = Math.min(100, Math.max(0, Math.round(score)));

  return {
    score,
    strengths,
    weaknesses,
    missingKeywords: keywordAnalysis.missingKeywords,
    recommendations,
  };
};

const analyzeRoleMatch = (extractedSkills = [], parsedContent = {}) => {
  const normalizedSkills = buildSkillSet(extractedSkills);
  const projectSkills = new Set(
    (parsedContent.sections?.projects || []).flatMap((project) =>
      (project.technologies || []).map((tech) => normalize(tech))
    )
  );

  const keywordWeights = {
    React: 3,
    'Node.js': 3,
    Express: 3,
    'Express.js': 3,
    MongoDB: 3,
    JavaScript: 2,
    TypeScript: 2,
    'REST API': 2,
    HTML: 2,
    CSS: 2,
    Angular: 2,
    Vue: 2,
    'Spring Boot': 2,
    Django: 2,
    GraphQL: 2,
    Python: 2,
    'Machine Learning': 2,
    'OpenAI API': 2,
    TensorFlow: 2,
    PyTorch: 2,
    NLP: 2,
    JWT: 2,
    Authentication: 2,
  };

  const coreSkillSets = {
    'MERN Developer': ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript'],
    'Frontend Developer': ['React', 'HTML', 'CSS', 'JavaScript', 'TypeScript'],
    'Backend Developer': ['Node.js', 'Express.js', 'REST API', 'Database', 'JavaScript'],
  };

  const hasJavaEnterprise = ['spring boot', 'hibernate', 'maven', 'gradle', 'junit'].some((keyword) => normalizedSkills.has(normalize(keyword)) || projectSkills.has(normalize(keyword)));
  const isMernResume = ['react', 'node.js', 'express.js', 'mongodb', 'javascript', 'typescript'].some((keyword) => normalizedSkills.has(normalize(keyword)) || projectSkills.has(normalize(keyword)));

  return roleProfiles
    .map((profile) => {
      const totalWeight = profile.keywords.reduce(
        (sum, keyword) => sum + (keywordWeights[keyword] || 1),
        0
      );
      const matchedWeight = profile.keywords.reduce((sum, keyword) => {
        if (normalizedSkills.has(normalize(keyword)) || projectSkills.has(normalize(keyword))) {
          return sum + (keywordWeights[keyword] || 1);
        }
        return sum;
      }, 0);

      let baseScore = totalWeight ? Math.round((matchedWeight / totalWeight) * 80) : 0;
      const roleCoreSkills = coreSkillSets[profile.role] || [];
      const hasCore = roleCoreSkills.length > 0 && roleCoreSkills.every((keyword) => normalizedSkills.has(normalize(keyword)) || projectSkills.has(normalize(keyword)));
      if (hasCore) baseScore = Math.max(baseScore, 85);

      let roleAdjustment = 0;
      if (profile.role === 'Java Developer' && !hasJavaEnterprise) {
        roleAdjustment -= 15;
      }
      if (profile.role === 'MERN Developer' && isMernResume) {
        roleAdjustment += 12;
      }
      if (profile.role === 'Frontend Developer' && normalizedSkills.has(normalize('React'))) {
        roleAdjustment += 6;
      }
      if (profile.role === 'Backend Developer' && (normalizedSkills.has(normalize('Node.js')) || normalizedSkills.has(normalize('Express.js')))) {
        roleAdjustment += 5;
      }

      const bonus = Math.min(20, projectSkills.size >= 3 ? 15 : projectSkills.size >= 1 ? 8 : 0);
      const experienceBonus = (parsedContent.sections?.experience?.length || 0) > 0 ? 5 : 0;

      return {
        role: profile.role,
        matchScore: Math.min(100, Math.max(0, baseScore + bonus + experienceBonus + roleAdjustment)),
        explanation: profile.explanation,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
};

const analyzeIndustryMatch = (extractedSkills = [], parsedContent = {}) => {
  const normalizedSkills = buildSkillSet(extractedSkills);
  const fullText = normalize(parsedContent.fullText || '');

  const matches = industryProfiles.map((profile) => {
    const score = profile.keywords.reduce((sum, keyword) => {
      if (fullText.includes(normalize(keyword)) || normalizedSkills.has(normalize(keyword))) {
        return sum + Math.round(100 / profile.keywords.length);
      }
      return sum;
    }, 0);
    return {
      industry: profile.name,
      matchScore: Math.min(100, score),
    };
  });

  return {
    industries: matches.filter((item) => item.matchScore >= 20),
  };
};

const generateAIRecommendations = (parsedContent = {}, atsScore = {}, keywordAnalysis = {}, roleMatch = []) => {
  const feedback = {
    strengths: [],
    weaknesses: [],
    recommendations: [],
    actionPlan: [],
  };

  feedback.strengths.push(...(atsScore.strengths || []).slice(0, 5));
  if (roleMatch[0]?.matchScore >= 80) {
    feedback.strengths.push(`Good fit for ${roleMatch[0].role}`);
  }
  if ((parsedContent.sections?.projects?.length || 0) >= 2) {
    feedback.strengths.push('Multiple project examples are present');
  }

  feedback.weaknesses.push(...(atsScore.weaknesses || []).slice(0, 4));
  if ((keywordAnalysis.missingKeywords || []).length) {
    feedback.weaknesses.push('Important keywords are missing from the resume');
  }
  if (!parsedContent.sections?.links?.github) {
    feedback.weaknesses.push('GitHub link is not present');
  }
  if (!parsedContent.sections?.links?.linkedIn) {
    feedback.weaknesses.push('LinkedIn profile is not present');
  }

  const recommendationSet = new Set([...(atsScore.recommendations || [])]);
  (keywordAnalysis.recommendedKeywords || []).slice(0, 3).forEach((keyword) => {
    recommendationSet.add(`Add or highlight ${keyword}`);
  });
  if (keywordAnalysis.roleFocus) {
    recommendationSet.add(`Optimize keywords for the ${keywordAnalysis.roleFocus} role`);
  }
  if (!parsedContent.sections?.links?.github) {
    recommendationSet.add('Include a GitHub link for recruiter validation');
  }
  if (!parsedContent.sections?.links?.linkedIn) {
    recommendationSet.add('Add a LinkedIn link to strengthen your professional profile');
  }
  recommendationSet.add('Use quantified achievements to show impact');
  recommendationSet.add('List technology stacks explicitly in each project');

  feedback.recommendations = Array.from(recommendationSet).slice(0, 8);
  feedback.actionPlan = [
    'Align skills and keywords to your target role',
    'Add quantifiable metrics for projects and achievements',
    'Include GitHub/LinkedIn links if available',
    'Highlight technologies used for each project',
  ];

  return feedback;
};

const calculateOverallScore = (atsScore = {}, extractedSkills = [], parsedContent = {}, roleMatch = []) => {
  const skillScore = Math.min(100, (extractedSkills.length || 0) * 10);
  const projectScore = Math.min(100, ((parsedContent.sections?.projects?.length || 0) * 25));
  const roleBonus = roleMatch[0]?.matchScore || 0;
  const overall = Math.round((atsScore.score || 0) * 0.4 + skillScore * 0.25 + projectScore * 0.2 + roleBonus * 0.15);

  let grade = 'F';
  if (overall >= 90) grade = 'A';
  else if (overall >= 80) grade = 'B';
  else if (overall >= 70) grade = 'C';
  else if (overall >= 60) grade = 'D';

  const summary =
    grade === 'A'
      ? 'Excellent resume with strong role alignment and measurable project impact.'
      : grade === 'B'
        ? 'Good resume; enhance keywords and achievements for stronger ATS results.'
        : grade === 'C'
          ? 'Average resume; add metrics, projects, and clearer role targeting.'
          : 'Resume needs improvement in structure, skills, and targeted messaging.';

  return {
    score: overall,
    grade,
    summary,
  };
};

module.exports = {
  calculateATSScore,
  analyzeKeywordMatch,
  analyzeRoleMatch,
  analyzeIndustryMatch,
  generateAIRecommendations,
  calculateOverallScore,
};
