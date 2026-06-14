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

const normalizeText = (text) => text.replace(/[""'']/g, "'").replace(/\s+/g, ' ').trim();

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
    } else if (/behance\.net|dribbble\.com/i.test(cleaned)) {
      links.projectUrls.push(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    } else {
      links.otherUrls.push(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    }
  });

  links.portfolio = links.projectUrls.length > 0 ? links.projectUrls[0] : links.otherUrls.length > 0 ? links.otherUrls[0] : '';

  return links;
};

module.exports = {
  parseDocument,
  parsePDF,
  parseDocx,
  extractPersonalInfo,
  extractSummary,
  extractExperience,
  extractEducation,
  extractCertifications,
  extractAchievements,
  extractLinks,
  findSkillsInText,
  skillDictionary,
};
