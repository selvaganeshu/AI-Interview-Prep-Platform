const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const skillDictionary = {
  'Programming Languages': [
    'Java',
    'Python',
    'JavaScript',
    'TypeScript',
    'C',
    'C++',
    'Go',
    'Ruby',
    'R',
    'Kotlin',
    'Swift',
    'Rust',
    'SQL',
  ],
  Frontend: [
    'React',
    'Angular',
    'Vue',
    'Vue.js',
    'HTML',
    'CSS',
    'Tailwind',
    'Bootstrap',
    'Next.js',
    'Redux',
    'Sass',
  ],
  Backend: [
    'Node.js',
    'Express.js',
    'Express',
    'Spring Boot',
    'Django',
    'Flask',
    'Ruby on Rails',
    'FastAPI',
    'ASP.NET',
    'Laravel',
    'GraphQL',
    'REST API',
  ],
  Database: [
    'MongoDB',
    'MySQL',
    'PostgreSQL',
    'Redis',
    'Oracle',
    'SQL Server',
    'DynamoDB',
  ],
  Cloud: [
    'AWS',
    'Azure',
    'GCP',
    'Google Cloud',
    'Firebase',
    'Heroku',
    'Azure DevOps',
  ],
  DevOps: [
    'Docker',
    'Kubernetes',
    'Jenkins',
    'Terraform',
    'GitHub Actions',
    'CircleCI',
    'Ansible',
    'Docker Compose',
  ],
  AI: [
    'Gemini API',
    'OpenAI API',
    'LangChain',
    'TensorFlow',
    'PyTorch',
    'scikit-learn',
    'Machine Learning',
    'NLP',
    'Computer Vision',
    'Data Science',
  ],
  Tools: [
    'Git',
    'GitHub',
    'JIRA',
    'Postman',
    'Swagger',
    'CI/CD',
    'Jest',
    'Mocha',
    'npm',
    'Yarn',
    'JWT',
    'Authentication',
  ],
};

const flattenSkills = Object.entries(skillDictionary).flatMap(([category, skills]) =>
  skills.map((skill) => ({ category, skill }))
);

const normalizeText = (text) => text.replace(/[“”‘’]/g, "'").replace(/\s+/g, ' ').trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSkillRegex = (term) => {
  const escaped = escapeRegex(term).replace(/\s+/g, '\\s+');
  return new RegExp(`\\b${escaped}\\b`, 'gi');
};

const splitLines = (text) =>
  text
    .split(/\r?\n/)
    .map((line) => normalizeText(line))
    .filter((line) => line.length > 0);

const collectBlocks = (lines) => {
  const blocks = [];
  let current = [];

  lines.forEach((line) => {
    if (!line.trim()) {
      if (current.length) {
        blocks.push(current);
        current = [];
      }
      return;
    }
    current.push(line.trim());
  });

  if (current.length) {
    blocks.push(current);
  }

  return blocks;
};

const findSectionStart = (lines, headingRegex) => lines.findIndex((line) => headingRegex.test(line));

const collectSectionLines = (lines, startIndex, stopRegex) => {
  const sectionLines = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (stopRegex.test(line)) break;
    sectionLines.push(line);
  }
  return sectionLines;
};

const findSkillsInText = (text) => {
  const normalized = normalizeText(text).toLowerCase();
  const categories = {};

  flattenSkills.forEach(({ category, skill }) => {
    const regex = buildSkillRegex(skill);
    if (regex.test(normalized)) {
      categories[category] = categories[category] || new Set();
      categories[category].add(skill);
    }
  });

  return Object.entries(categories).map(([category, items]) => ({
    category,
    items: Array.from(items).sort(),
  }));
};

const parsePDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    // Debug logs for PDF extraction
    try {
      console.log('RAW PDF TEXT');
      console.log(typeof data.text === 'string' ? data.text : String(data.text));
      console.log('TEXT LENGTH');
      console.log(String(data.text).length);
    } catch (logErr) {
      console.warn('Failed logging PDF text:', logErr.message);
    }
    return {
      fullText: data.text,
      pages: data.numpages,
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

const parseDocx = async (docxBuffer) => {
  try {
    const { value } = await mammoth.extractRawText({ buffer: docxBuffer });
    return {
      fullText: normalizeText(value),
      pages: 0,
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
};

const parseDocument = async (buffer, fileType = 'pdf') => {
  const normalizedType = String(fileType).toLowerCase();
  if (normalizedType === 'docx' || normalizedType === 'doc') {
    return parseDocx(buffer);
  }
  return parsePDF(buffer);
};

const normalizePhone = (value) => {
  if (!value || typeof value !== 'string') return '';
  const digits = (value.match(/\d/g) || []).join('');
  if (digits.length < 7 || digits.length > 15) return '';
  return value.replace(/[\s()]+/g, ' ').trim();
};

const isLikelyName = (line) => {
  const cleaned = line.replace(/[\d@:\/\|\-\u2013\u2014]/g, '').trim();
  if (!cleaned || cleaned.length < 3 || cleaned.length > 60) return false;
  const stopWords = ['objective', 'summary', 'skills', 'education', 'experience', 'projects', 'certifications', 'achievements', 'internship', 'contact', 'personal', 'professional', 'profile', 'linkedin', 'github', 'portfolio'];
  if (stopWords.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(cleaned))) return false;
  if (/[,:;\/\(\)]/.test(cleaned)) return false;
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;
  const capitalized = words.filter((word) => /^[A-Z][a-z]/.test(word)).length;
  return capitalized >= Math.ceil(words.length / 2);
};

const extractLocation = (lines) => {
  const locationTerms = [
    'India', 'USA', 'United States', 'United Kingdom', 'UK', 'Canada', 'Australia', 'Bangalore', 'Bengaluru', 'Chennai', 'Pune', 'Mumbai', 'Kolkata', 'Hyderabad', 'Delhi', 'New York', 'California', 'Texas', 'London', 'Berlin', 'Toronto', 'Singapore', 'Dubai', 'Seattle', 'Boston', 'Austin', 'San Francisco', 'Los Angeles', 'Remote', 'Work From Home', 'WFH'
  ];
  for (const line of lines) {
    const cleaned = line.trim();
    if (!cleaned) continue;
    if (/\b(\d{5}|\d{6})\b/.test(cleaned)) continue;
    if (/\b(?:[A-Z][a-z]+\s*){1,3},?\s*(?:India|USA|UK|Canada|Australia|Germany|Singapore|UAE|United States|United Kingdom)\b/i.test(cleaned)) {
      return cleaned;
    }
    if (locationTerms.some((term) => new RegExp(`\\b${escapeRegex(term)}\\b`, 'i').test(cleaned))) {
      return cleaned;
    }
  }
  return '';
};

const extractPersonalInfo = (text) => {
  const lines = splitLines(text).slice(0, 12);
  const info = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    github: '',
    portfolio: '',
  };

  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,})/);
  if (emailMatch) info.email = emailMatch[1].trim();

  const phoneCandidates = Array.from(new Set(text.match(/\+?\d[\d\s().-]{7,}\d/g) || []))
    .filter((value) => !/^\d{4}\s*[-–—]\s*\d{4}$/.test(value.trim()))
    .map(normalizePhone)
    .filter(Boolean);
  if (phoneCandidates.length) {
    info.phone = phoneCandidates.sort((a, b) => b.replace(/\D/g, '').length - a.replace(/\D/g, '').length)[0];
  }

  const linkedInMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in\/)?([A-Za-z0-9-_%]+)/i);
  if (linkedInMatch) {
    info.linkedIn = `https://www.linkedin.com/in/${linkedInMatch[1]}`;
  }

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com[\/:](?:@)?([A-Za-z0-9_.-]+)/i);
  if (githubMatch) {
    info.github = `https://github.com/${githubMatch[1]}`;
  }

  const portfolioMatch = text.match(/(?:^|[\s(\[{<>"])(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]{2,}\.(?:com|dev|io|tech|me)(?:\/[^{\s,}]*)?/i);
  if (portfolioMatch) {
    const url = portfolioMatch[0].trim();
    const candidate = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').toLowerCase();
    const ignoredDomains = ['gmail.com', 'mail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
    if (
      !/@/.test(url) &&
      !url.toLowerCase().includes('linkedin.com') &&
      !url.toLowerCase().includes('github.com') &&
      !ignoredDomains.some((domain) => candidate.startsWith(domain))
    ) {
      info.portfolio = url.startsWith('http') ? url : `https://${url}`;
    }
  }

  const candidateLines = lines.filter((line) => !/\b(objective|summary|education|experience|projects|skills|certifications|achievements|internship|contact|linkedin|github|portfolio)\b/i.test(line));
  info.name = candidateLines.map((line) => line.trim()).find(isLikelyName) || lines.map((line) => line.trim()).find(isLikelyName) || '';
  info.location = extractLocation(candidateLines) || extractLocation(lines);

  return info;
};

const extractSummary = (text) => {
  const lines = splitLines(text);
  const summaryIndex = findSectionStart(lines, /\b(summary|professional summary|career summary|summary statement)\b/i);
  if (summaryIndex !== -1) {
    const sectionLines = collectSectionLines(lines, summaryIndex, /\b(experience|education|skills|projects|certifications|awards|publications|achievements|objective)\b/i);
    return sectionLines.slice(0, 3).join(' ').trim();
  }

  // Fallback: first section before Experience or Education
  const fallbackStop = lines.findIndex((line) => /\b(experience|education|skills|projects|certifications)\b/i.test(line));
  if (fallbackStop > 0) {
    return lines.slice(0, Math.min(3, fallbackStop)).join(' ').trim();
  }

  return '';
};

const extractExperience = (text) => {
  const experiences = [];
  const lines = splitLines(text);
  const headingIndex = findSectionStart(lines, /\b(experience|work experience|professional experience|employment history|relevant experience|internship|internships|training|industrial training)\b/i);
  const sectionLines = headingIndex !== -1 ? collectSectionLines(lines, headingIndex, /\b(education|skills|projects|certifications|awards|publications|summary|objective|achievements|personal information|contact)\b/i) : lines;

  let currentExp = null;

  const commitExp = () => {
    if (currentExp) {
      experiences.push(currentExp);
      currentExp = null;
    }
  };

  sectionLines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    const titleCompanyMatch = line.match(/^(?<title>.+?)\s+(?:at|@)\s+(?<company>.+?)(?:\s*(?:\||[-–—])\s*(?<duration>(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{4}(?:\s*(?:\||[-–—])\s*(?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{4}))?|\d{4}(?:\s*(?:\||[-–—])\s*(?:Present|Current|\d{4}))?))?$/i);
    const companyDurationMatch = line.match(/^(?<company>.+?)\s*[|–—-]\s*(?<duration>(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{4}|Present|Current|\d{4})(?:\s*[|–—-]\s*(?<ending>Present|Current|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{4}))?$/i);
    const internshipLine = line.match(/^(?<title>.+?)\s+(?:internship|intern|trainee|training)\b.*?(?:at|@)?\s*(?<company>.+)?$/i);
    if (titleCompanyMatch || internshipLine) {
      commitExp();
      const match = titleCompanyMatch || internshipLine;
      currentExp = {
        jobTitle: (match.groups?.title || line).trim(),
        company: (match.groups?.company || 'Unknown Company').trim(),
        duration: (match.groups?.duration || '').trim(),
        description: '',
        responsibilities: [],
      };
      return;
    }

    if (currentExp && !currentExp.company && companyDurationMatch) {
      currentExp.company = companyDurationMatch.groups.company.trim();
      currentExp.duration = companyDurationMatch.groups.duration.trim() + (companyDurationMatch.groups.ending ? ` - ${companyDurationMatch.groups.ending.trim()}` : '');
      return;
    }

    if (!currentExp && /\b(internship|intern|trainee|training|work experience|project experience)\b/i.test(line)) {
      commitExp();
      currentExp = {
        jobTitle: line,
        company: '',
        duration: '',
        description: '',
        responsibilities: [],
      };
      return;
    }

    const durationMatch = line.match(/(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{4}\b)\s*[-–—]\s*(Present|Current|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{4}\b)/i) || line.match(/\b\d{4}\b\s*[-–—]\s*(Present|Current|\d{4})\b/i);
    if (currentExp && durationMatch && !currentExp.duration) {
      currentExp.duration = line;
      return;
    }

    if (currentExp) {
      if (/^[\-•*]/.test(line)) {
        currentExp.responsibilities.push(line.replace(/^[\-•*]+/, '').trim());
      } else {
        currentExp.description += `${currentExp.description ? ' ' : ''}${line}`;
      }
    }
  });

  commitExp();
  return experiences;
};

const extractEducation = (text) => {
  const education = [];
  const lines = splitLines(text);
  const headingIndex = findSectionStart(lines, /\b(education|academic background|qualifications|academic qualifications|education & training)\b/i);
  const sectionLines = headingIndex !== -1 ? collectSectionLines(lines, headingIndex, /\b(experience|skills|certifications|projects|awards|publications|summary|objective|achievements)\b/i) : [];

  const educationBlocks = collectBlocks(sectionLines);

  educationBlocks.forEach((block) => {
    const blockText = block.join(' ').replace(/\s+/g, ' ').trim();
    if (!blockText) return;

    const degreeMatch = blockText.match(/\b(Higher Secondary Education|Higher Secondary|Senior Secondary|High School|B\.E\.|BE|B\.Tech|BTech|Bachelor(?: of Technology| of Science| of Engineering)?|BSc|B\.Sc\.|B\.S\.|MCA|M\.C\.A\.|M\.Sc\.|MSc|M\.S\.|MBA|Ph\.D\.|PhD|Master(?: of Science| of Arts)?|Diploma)\b/i);
    const schoolMatch = blockText.match(/\b([A-Za-z0-9 &'.,\-]+(?:College|Institute|University|School|Academy|Technology|Engineering|Center|Centre|IIT|NIT|BITS))\b/i);
    const yearRangeMatch = blockText.match(/\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|19\d{2}|Present|Current)\b/i);
    const durationMatch = blockText.match(/\b(20\d{2}|19\d{2})(?:\s*[-–—]\s*(20\d{2}|19\d{2}|Present|Current))?\b/i);
    const gpaMatch = blockText.match(/\b(?:CGPA|GPA)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
    const percentageMatch = blockText.match(/\b(\d{1,3}(?:\.\d+)?)\s*%\b/i);

    const degree = degreeMatch ? degreeMatch[0].trim() : blockText.match(/\b(Higher Secondary|Senior Secondary|High School)\b/i)?.[0] || '';
    const institution = schoolMatch ? schoolMatch[1].trim() : '';
    const score = gpaMatch ? gpaMatch[1] : percentageMatch ? `${percentageMatch[1]}%` : '';
    const duration = yearRangeMatch ? yearRangeMatch[0] : durationMatch ? durationMatch[0] : '';

    if (degree || institution || score || duration) {
      education.push({
        degree: degree || 'Education',
        institution,
        score,
        duration,
      });
    }
  });

  return education;
};

const extractCertifications = (text) => {
  const lines = splitLines(text);
  const headingIndex = findSectionStart(lines, /\b(certifications|certificates|licenses|credentials)\b/i);
  if (headingIndex === -1) return [];

  const sectionLines = collectSectionLines(lines, headingIndex, /\b(experience|education|skills|projects|awards|publications|summary|objective|achievements)\b/i);
  return sectionLines
    .filter((line) => /^[\-•*]/.test(line) || line.length > 0)
    .map((line) => line.replace(/^[\-•*]+\s*/, '').trim());
};

const extractAchievements = (text) => {
  const lines = splitLines(text);
  const headingIndex = findSectionStart(lines, /\b(achievements|accomplishments|awards|honors|notable projects|key achievements)\b/i);
  let sectionLines = [];
  if (headingIndex !== -1) {
    sectionLines = collectSectionLines(lines, headingIndex, /\b(experience|education|skills|projects|certifications|summary|objective|contact|personal information)\b/i);
  } else {
    sectionLines = lines.filter((line) => /\b(solved\s*\d+\+?|NPTEL\s+Elite|Paper\s+Presentation|Hackathon|certified\b|certification\b|achieved\b|award\b|winner\b|finalist\b)/i.test(line));
  }

  const normalized = sectionLines
    .map((line) => line.replace(/^[\-•*]+\s*/, '').trim())
    .filter((line) => line.length > 0);

  if (normalized.length > 0) {
    return normalized;
  }

  // fallback: find achievement-like phrases in body text
  const fallbackMatches = Array.from(new Set(text.match(/(?:solved\s*\d+\+?|NPTEL\s+Elite|Paper\s+Presentation|Hackathon(?:\s*Finalist|\s*Winner)?|certified\s*in\s*[A-Za-z0-9 &]+|certification\s*in\s*[A-Za-z0-9 &]+|completed\s*.*certificate)/gi) || []));
  return fallbackMatches.map((item) => item.trim()).filter(Boolean);
};

const extractLinks = (text) => {
  const links = {
    linkedIn: '',
    github: '',
    portfolio: '',
    projectUrls: [],
    otherUrls: [],
  };

  const ignoredDomains = ['gmail.com', 'mail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
  const urlRegex = /((?<!@)(?:https?:\/\/|mailto:)?(?:www\.)?(?:linkedin\.com|github\.com|behance\.net|dribbble\.com|dev\.to|medium\.com|[a-zA-Z0-9-]{2,}\.(?:com|dev|io|tech|me))(?:\/[^\s,]*)?)/gi;
  const uniqueUrls = Array.from(
    new Set(
      (text.match(urlRegex) || [])
        .map((url) => url.trim())
        .map((url) => url.replace(/^(?:mailto:)/i, ''))
        .map((url) => url.replace(/^[,;\s]+|[.,;\s]+$/g, ''))
        .filter((url) => {
          if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(url)) return false;
          const candidate = url.replace(/^(?:https?:\/\/|www\.)/i, '');
          const candidateDomain = candidate.split('/')[0].toLowerCase();
          if (ignoredDomains.includes(candidateDomain)) return false;
          const emailDomainPattern = new RegExp(`[A-Za-z0-9._%+-]+@${escapeRegex(candidate)}\\b`, 'i');
          return !emailDomainPattern.test(text);
        })
    )
  );

  uniqueUrls.forEach((url) => {
    const cleaned = url.replace(/[.,;]$/, '');
    if (/linkedin\.com\/(?:in\/)?/i.test(cleaned)) {
      links.linkedIn = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
    } else if (/github\.com\//i.test(cleaned)) {
      links.github = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
    } else if (/portfolio|behance|dribbble|dev\.to|medium\.com|site\/|page\//i.test(cleaned)) {
      links.portfolio = links.portfolio || (cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
      links.otherUrls.push(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    } else {
      links.projectUrls.push(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    }
  });

  const shorthandPatterns = [
    { regex: /\bgithub\s*[:\/]{1,2}?\s*([A-Za-z0-9_.-]+)\b/i, key: 'github' },
    { regex: /\blinkedin\s*[:\/]{1,2}?\s*([A-Za-z0-9-_%]+)\b/i, key: 'linkedIn' },
    { regex: /\bportfolio\s*[:\/]{1,2}?\s*([^\s]+)/i, key: 'portfolio' },
  ];

  shorthandPatterns.forEach(({ regex, key }) => {
    const match = text.match(regex);
    if (match && match[1]) {
      const value = match[1].trim().replace(/[.,;]$/, '');
      if (key === 'github' && !links.github) {
        links.github = `https://github.com/${value}`;
      }
      if (key === 'linkedIn' && !links.linkedIn) {
        links.linkedIn = `https://www.linkedin.com/in/${value}`;
      }
      if (key === 'portfolio' && !links.portfolio) {
        links.portfolio = value.startsWith('http') ? value : `https://${value}`;
      }
    }
  });

  return links;
};

const determineProjectComplexity = (description, technologies) => {
  const advancedMarkers = [
    'machine learning',
    'deep learning',
    'natural language',
    'distributed',
    'scalable',
    'microservices',
    'real-time',
    'high-performance',
    'cloud-native',
    'ai',
  ];
  const normalized = description.toLowerCase();
  const hasAdvanced = advancedMarkers.some((marker) => normalized.includes(marker));
  const hasModernTech = technologies.some((skill) =>
    ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'GraphQL', 'TensorFlow', 'PyTorch', 'Spring Boot', 'React', 'Node.js'].includes(skill)
  );

  if (hasAdvanced || (hasModernTech && technologies.length >= 4)) {
    return 'Advanced';
  }
  if (technologies.length >= 2) {
    return 'Intermediate';
  }
  return 'Beginner';
};

const determineProjectDomain = (description) => {
  const domainMap = {
    'AI + Education': ['learning', 'education', 'tutor', 'course', 'student', 'teacher'],
    'AI + Healthcare': ['health', 'medical', 'patient', 'clinical', 'healthcare'],
    Fintech: ['finance', 'bank', 'payments', 'trading', 'investment', 'billing'],
    'E-commerce': ['e-commerce', 'commerce', 'shop', 'checkout', 'catalog', 'store'],
    'Data Analytics': ['analytics', 'dashboard', 'insights', 'report', 'metrics', 'visualization'],
    'Enterprise Software': ['enterprise', 'workflow', 'platform', 'solution', 'system'],
    'AI + Chatbot': ['chatbot', 'conversational', 'dialog', 'nlp', 'virtual assistant'],
  };

  const normalized = description.toLowerCase();
  for (const [domain, terms] of Object.entries(domainMap)) {
    if (terms.some((term) => normalized.includes(term))) {
      return domain;
    }
  }

  return 'General Software';
};

const extractProjects = (text) => {
  const lines = splitLines(text);
  const headingIndex = findSectionStart(lines, /\b(projects|project experience|selected projects|academic projects)\b/i);
  const sectionLines = headingIndex !== -1 ? collectSectionLines(lines, headingIndex, /\b(experience|education|skills|certifications|awards|publications|leadership|summary|objective|achievements|contact|personal information)\b/i) : [];

  const projects = [];
  let currentProject = null;

  const commitProject = () => {
    if (currentProject) {
      projects.push(currentProject);
      currentProject = null;
    }
  };

  const extractTechItems = (value) =>
    value
      .split(/[,;|]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

  const isProjectTitleLine = (line) => {
    const cleaned = line.replace(/^[\-•*]+\s*/, '').trim();
    if (/^(?:description|technologies|tools|stack|complexity|link)\b/i.test(cleaned)) return false;
    if (/^(?:built|developed|created|implemented|designed|engineered|worked|deployed|built)\b/i.test(cleaned)) return false;
    if (/\b(Project|Assistant|System|Application|Platform|App|Portal|Dashboard|Tool|Manager|Service|Engine|Website|Product)\b/i.test(cleaned) && cleaned.length < 80) {
      return true;
    }
    return false;
  };

  sectionLines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;

    const projectBulletMatch = line.match(/^[\-•*]+\s*(.+?)\s*[:\-]\s*(.+)$/i);
    const techLine = line.match(/^(?:technologies|tools|tech stack|stack|frameworks?)\s*[:\-]\s*(.+)$/i);
    const complexityLine = line.match(/^(?:complexity|level)\s*[:\-]\s*(.+)$/i);
    const titleLineCandidate = line.replace(/^[\-•*]+\s*/, '');
    const titleLine = isProjectTitleLine(titleLineCandidate);
    const projectLinkMatch = line.match(/https?:\/\/[^\s]+/i);

    if (projectBulletMatch) {
      commitProject();
      currentProject = {
        name: projectBulletMatch[1].trim(),
        description: projectBulletMatch[2].trim(),
        technologies: [],
        complexity: '',
        link: projectLinkMatch ? projectLinkMatch[0].replace(/[.,;]$/, '') : '',
      };
      return;
    }

    if (titleLine && !/^description\b/i.test(titleLineCandidate)) {
      commitProject();
      currentProject = {
        name: titleLineCandidate.trim(),
        description: '',
        technologies: [],
        complexity: '',
        link: projectLinkMatch ? projectLinkMatch[0].replace(/[.,;]$/, '') : '',
      };
      return;
    }

    const explicitProjectLabel = line.match(/^project\s*[:\-]\s*(.+)$/i);
    if (explicitProjectLabel) {
      commitProject();
      currentProject = {
        name: explicitProjectLabel[1].trim(),
        description: '',
        technologies: [],
        complexity: '',
        link: projectLinkMatch ? projectLinkMatch[0].replace(/[.,;]$/, '') : '',
      };
      return;
    }

    if (!currentProject && techLine) {
      currentProject = {
        name: 'Unnamed Project',
        description: '',
        technologies: [],
        complexity: '',
        link: '',
      };
    }

    if (!currentProject) return;

    if (techLine) {
      currentProject.technologies.push(...extractTechItems(techLine[1]));
      return;
    }

    if (complexityLine) {
      currentProject.complexity = complexityLine[1].trim();
      return;
    }

    if (projectLinkMatch) {
      currentProject.link = projectLinkMatch[0].replace(/[.,;]$/, '');
      return;
    }

    if (/^description\s*[:\-]/i.test(line)) {
      currentProject.description += `${currentProject.description ? ' ' : ''}${line.replace(/^description\s*[:\-]\s*/i, '')}`;
      return;
    }

    currentProject.description += `${currentProject.description ? ' ' : ''}${line}`;
  });

  commitProject();

  return projects.map((project) => {
    const technologies = [
      ...new Set([
        ...project.technologies,
        ...extractSkills(project.description).flatMap((item) => item.items),
      ]),
    ];
    const description = project.description.trim();
    const complexity = project.complexity || determineProjectComplexity(description, technologies);
    const domain = determineProjectDomain(description);

    return {
      name: project.name,
      description,
      technologies,
      complexity,
      domain,
      link: project.link,
    };
  });
};

const parseAchievementStringBlock = (rawValue) => {
  if (typeof rawValue !== 'string' || !rawValue.trim()) return [];
  const cleaned = rawValue.trim();
  if (/^\s*\[.*\]\s*$/s.test(cleaned) && cleaned.includes('{')) {
    const inner = cleaned.replace(/^\s*\[|\]\s*$/g, '');
    const items = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < inner.length; i += 1) {
      const char = inner[i];
      if (char === '{') {
        depth += 1;
      }
      if (depth > 0) {
        current += char;
      }
      if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          const parsed = parseAchievementStringBlock(current);
          if (parsed.length) {
            items.push(...parsed);
          }
          current = '';
        }
      }
    }

    return items;
  }

  const objectMatch = cleaned.match(/\{([^}]+)\}/);
  if (objectMatch) {
    const textMatch = objectMatch[1].match(/text\s*[:=]\s*['"]([^'"]+)['"]/i);
    const typeMatch = objectMatch[1].match(/type\s*[:=]\s*['"]([^'"]+)['"]/i);
    const strengthMatch = objectMatch[1].match(/strength\s*[:=]\s*['"]([^'"]+)['"]/i);
    if (textMatch) {
      return [
        {
          text: textMatch[1].trim(),
          type: typeMatch?.[1]?.trim() || 'Achievement',
          strength: strengthMatch?.[1]?.trim() || 'Strong Achievement',
        },
      ];
    }
  }

  return cleaned
    .split(/\n|;|\r\n|\|/)
    .map((item) => item.trim())
    .filter((item) => item)
    .map((text) => ({ text, type: 'Achievement', strength: 'Strong Achievement' }));
};

const extractSkills = (text) => findSkillsInText(text);

// Helper: split text into sections by common resume headings while preserving headers
const SECTION_HEADINGS = [
  'personal information',
  'contact',
  'links',
  'objective',
  'summary',
  'professional summary',
  'experience',
  'work experience',
  'professional experience',
  'internship',
  'internships',
  'training',
  'industrial training',
  'projects',
  'project experience',
  'selected projects',
  'education',
  'academic background',
  'skills',
  'technical skills',
  'certifications',
  'achievements',
  'accomplishments',
  'awards',
];

const buildHeadingRegex = () => new RegExp(`\\b(?:${SECTION_HEADINGS.map(escapeRegex).join('|')})\\b`, 'i');

const splitIntoSections = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => normalizeText(l))
    .filter(() => true); // keep empty lines for header detection

  const sections = {};
  let currentKey = 'header';
  sections[currentKey] = [];
  const headingRegex = buildHeadingRegex();

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) {
      // preserve paragraph breaks
      sections[currentKey].push('');
      continue;
    }

    if (headingRegex.test(line)) {
      // pick the canonical heading term that matched
      const matcher = new RegExp(`\\b(${SECTION_HEADINGS.map(escapeRegex).join('|')})\\b`, 'i');
      const m = line.match(matcher);
      const heading = m && m[1] ? m[1].toLowerCase() : line.toLowerCase().replace(/[:\\-]$/, '').trim();
      currentKey = heading;
      sections[currentKey] = sections[currentKey] || [];
      continue;
    }

    // If the line looks like an explicit uppercase heading (e.g., "PROJECTS") accept it
    if (/^[A-Z\s]{3,}$/.test(line) && line.length < 60) {
      const heading = line.toLowerCase().trim();
      currentKey = heading;
      sections[currentKey] = sections[currentKey] || [];
      continue;
    }

    sections[currentKey].push(line);
  }

  // convert to text blocks
  const result = {};
  for (const [k, arr] of Object.entries(sections)) {
    result[k] = arr.join('\n').trim();
  }
  return result;
};

// Validation helpers
const educationFound = (text) => /\b(CGPA|GPA|B\.E\.|BE|B\.Tech|BTech|M\.Sc|MSc|Bachelor|Master|College|University)\b/i.test(text);
const projectFound = (text) => /\b(Developed|Built|Implemented|Created|Designed|Engineered)\b/i.test(text);

// Fallback regex extractors when structured extraction fails
const fallbackExtractEducation = (text) => {
  const matches = [];
  const eduRegex = /(B\.E\.|BE|B\.Tech|BTech|M\.Sc|MSc|B\.Sc|BSc|MBA|Ph\.D\.|PhD|Bachelor|Master)[^\n\r]{0,120}/gi;
  let m;
  while ((m = eduRegex.exec(text))) {
    matches.push(m[0].trim());
  }
  // CGPA / GPA lines
  const gpaRegex = /(?:CGPA|GPA)\s*[:\-]?\s*(\d+(?:\.\d+)?)/gi;
  const gpaMatch = text.match(gpaRegex);
  return { degrees: matches, gpa: gpaMatch ? gpaMatch.map((s) => s.trim()) : [] };
};

const fallbackExtractProjects = (text) => {
  const projects = [];
  const projRegex = /(?:\n|^)[\-•*]?\s*([A-Z][^:\n\r]{2,80}?)\s*[:\-]\s*([^\n\r]{10,300})/gi;
  let m;
  while ((m = projRegex.exec(text))) {
    const title = m[1].trim();
    const description = m[2].trim();
    if (/^(Objective|Summary|Education|Skills|Experience|Certifications|Contact|Personal|Professional|Internship)\b/i.test(title)) continue;
    if (!/\b(project|app|application|platform|system|tool|website|dashboard|service|solution|portal|engine)\b/i.test(title) &&
        !/\b(built|developed|created|implemented|designed|engineered|deployed|framework|technology|stack|API)\b/i.test(description)) {
      continue;
    }
    projects.push({ name: title, description });
  }
  return projects;
};

const fallbackExtractExperience = (text) => {
  const exps = [];
  const expRegex = /([A-Za-z ]{2,60})\s+(?:at|@)\s+([A-Za-z0-9 &.\-]{2,80})(?:\s*[|\-–—]\s*([^\n\r]+))?/gi;
  let m;
  while ((m = expRegex.exec(text))) {
    exps.push({ jobTitle: m[1].trim(), company: m[2].trim(), duration: m[3] ? m[3].trim() : '' });
  }
  return exps;
};

const fallbackExtractSkills = (text) => {
  const skills = [];
  const skillHints = ['Java', 'Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'SQL', 'Docker'];
  for (const s of skillHints) {
    const r = new RegExp(`\\b${escapeRegex(s)}\\b`, 'i');
    if (r.test(text)) skills.push(s);
  }
  return skills;
};

const extractSections = (text) => {
  const rawSections = splitIntoSections(text);
  const normalized = normalizeText(text);

  // Use header block (text before first explicit heading) for personal info heuristics
  const headerText = rawSections.header || '';

  const personalSource = headerText || rawSections['personal information'] || rawSections.contact || normalized.split(/\n\n/)[0] || '';

  const experienceSource =
    rawSections.experience ||
    rawSections['work experience'] ||
    rawSections['professional experience'] ||
    rawSections.internship ||
    rawSections.internships ||
    rawSections.training ||
    rawSections['industrial training'] ||
    text;

  const sections = {
    personalInfo: extractPersonalInfo(personalSource || text),
    summary: extractSummary(rawSections.summary || rawSections['professional summary'] || text),
    experience: extractExperience(experienceSource),
    education: extractEducation(rawSections.education || rawSections['academic background'] || text),
    skills: extractSkills(rawSections.skills || rawSections['technical skills'] || text),
    certifications: extractCertifications(rawSections.certifications || text),
    achievements: extractAchievements(rawSections.achievements || rawSections['accomplishments'] || text),
    projects: extractProjects(rawSections.projects || rawSections['project experience'] || text),
    links: extractLinks(personalSource || text),
  };

  const contactFound = Boolean(
    sections.personalInfo?.email ||
    sections.personalInfo?.phone ||
    sections.links?.linkedIn ||
    sections.links?.github ||
    sections.links?.portfolio
  );

  const validated = {
    educationFound:
      (sections.education && sections.education.length > 0) ||
      educationFound((rawSections.education || '') + ' ' + (rawSections['academic background'] || '')),
    projectFound:
      (sections.projects && sections.projects.length > 0 && sections.projects.some((p) => projectFound(p.description || ''))) ||
      projectFound((rawSections.projects || '') + ' ' + (rawSections['project experience'] || '')),
    skillsFound: Boolean(sections.skills && sections.skills.length > 0),
    contactFound,
  };

  // Apply fallback extraction when parser didn't find key elements
  try {
    if ((!sections.education || sections.education.length === 0) && normalized) {
      const fe = fallbackExtractEducation(normalized);
      if (fe.degrees.length > 0 || fe.gpa.length > 0) {
        sections.education = fe.degrees.map((d) => ({ degree: d, field: '', school: '', graduationYear: '', gpa: fe.gpa.join('; ') }));
      }
    }

    if ((!sections.projects || sections.projects.length === 0) && normalized) {
      const fp = fallbackExtractProjects(normalized);
      if (fp.length > 0) sections.projects = fp.map((p) => ({ name: p.name, description: p.description, technologies: fallbackExtractSkills(p.description), complexity: '', domain: '', link: '' }));
    }

    if ((!sections.experience || sections.experience.length === 0) && normalized) {
      const fe = fallbackExtractExperience(normalized);
      if (fe.length > 0) sections.experience = fe;
    }

    if ((!sections.skills || sections.skills.length === 0) && normalized) {
      const fs = fallbackExtractSkills(normalized);
      if (fs.length > 0) sections.skills = [{ category: 'Fallback', items: fs }];
    }

    if (!contactFound && normalized) {
      const fallbackContact = extractPersonalInfo(normalized);
      sections.personalInfo = {
        ...sections.personalInfo,
        ...fallbackContact,
      };
    }
  } catch (fallbackErr) {
    console.warn('Fallback extraction failed:', fallbackErr.message);
  }

  return {
    sections,
    rawSections,
    validated,
  };
};

const allKnownSkills = flattenSkills.map((item) => item.skill);

module.exports = {
  parsePDF,
  parseDocument,
  extractSections,
  extractSkills,
  extractProjects,
  extractAchievements,
  extractLinks,
  parseAchievementStringBlock,
  allKnownSkills,
  skillDictionary,
};
