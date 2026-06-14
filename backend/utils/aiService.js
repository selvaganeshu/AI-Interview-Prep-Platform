const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Question generation templates by type and difficulty
const questionPrompts = {
  technical: {
    Easy: `Generate 5 easy-level technical interview questions for the following categories: {categories}. 
    Each question should:
    - Be suitable for junior developers
    - Be clear and concise
    - Test fundamental knowledge
    - Include key concepts
    
    Format the response as JSON array with fields: questionText, category, expectedAnswer, hints (array of 3-4 hints)`,

    Medium: `Generate 5 medium-level technical interview questions for the following categories: {categories}.
    Each question should:
    - Test practical application of concepts
    - Require explanation of trade-offs
    - Test problem-solving skills
    - Be appropriate for mid-level developers
    
    Format the response as JSON array with fields: questionText, category, expectedAnswer, hints (array of 3-4 hints)`,

    Hard: `Generate 5 hard-level technical interview questions for the following categories: {categories}.
    Each question should:
    - Test deep understanding and system design
    - Involve complex problem-solving
    - Require architectural thinking
    - Be challenging for senior developers
    
    Format the response as JSON array with fields: questionText, category, expectedAnswer, hints (array of 3-4 hints)`,
  },
  hr: {
    Easy: `Generate 5 easy-level HR and behavioral interview questions.
    Each question should:
    - Be open-ended but not too complex
    - Help understand basic soft skills
    - Be comfortable for candidates
    - Focus on communication and teamwork
    
    Format the response as JSON array with fields: questionText, category (default: 'Communication'), expectedAnswer, hints (array of 3-4 hints)`,

    Medium: `Generate 5 medium-level HR and behavioral interview questions.
    Each question should:
    - Test decision-making skills
    - Assess conflict resolution
    - Evaluate problem-solving approach
    - Test cultural fit
    
    Format the response as JSON array with fields: questionText, category (default: 'Leadership'), expectedAnswer, hints (array of 3-4 hints)`,

    Hard: `Generate 5 hard-level HR and behavioral interview questions.
    Each question should:
    - Test leadership and strategic thinking
    - Assess handling of complex situations
    - Evaluate career growth mindset
    - Test emotional intelligence
    
    Format the response as JSON array with fields: questionText, category (default: 'Leadership'), expectedAnswer, hints (array of 3-4 hints)`,
  },
};

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Generate interview questions
   */
  async generateQuestions(interviewType, difficulty, categories, count = 5) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Falling back to offline question generation.');
      return this.generateOfflineQuestions(interviewType, difficulty, categories, count);
    }

    try {
      const categoryList = categories && categories.length > 0 ? categories.join(', ') : 'General';
      const prompt = questionPrompts[interviewType]?.[difficulty] || questionPrompts.technical.Medium;
      const finalPrompt = prompt.replace('{categories}', categoryList);

      const result = await this.model.generateContent(`${finalPrompt}

      Generate exactly ${count} questions. Respond with ONLY valid JSON array, no other text.`);
      const response = result.response;
      const text = typeof response?.text === 'function' ? response.text() : String(response);

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || text.match(/(\[[\s\S]*\])/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const questions = JSON.parse(jsonText);

      return questions.map((q, index) => ({
        questionText: q.questionText || q.question || '',
        category: q.category || categories?.[0] || 'General',
        difficulty,
        interviewType,
        expectedAnswer: q.expectedAnswer || q.answer || '',
        hints: q.hints || [],
        tags: q.tags || [difficulty, interviewType],
        orderNumber: index + 1,
        generatedByAI: true,
      }));
    } catch (error) {
      console.error('Error generating questions:', error);
      console.warn('Falling back to offline question generation after AI failure.');
      return this.generateOfflineQuestions(interviewType, difficulty, categories, count);
    }
  }

  generateOfflineQuestions(interviewType, difficulty, categories, count = 5) {
    const categoryLabel = categories && categories.length > 0 ? categories[0] : 'General';
    const template = {
      technical: [
        {
          questionText: `Explain the difference between synchronous and asynchronous JavaScript in ${categoryLabel}.`,
          category: categoryLabel,
          expectedAnswer: 'Synchronous code runs in order, asynchronous code can run later without blocking the main thread.',
          hints: ['Think event loop', 'Callbacks vs promises', 'Non-blocking I/O'],
        },
        {
          questionText: `What is ${categoryLabel} event delegation and why is it useful?`,
          category: categoryLabel,
          expectedAnswer: 'Event delegation uses a single listener higher up in the DOM to handle events for multiple child elements.',
          hints: ['DOM event bubbling', 'Performance', 'Reduced listeners'],
        },
      ],
      hr: [
        {
          questionText: `Tell me about a time you worked as part of a team on a ${categoryLabel}-related project.`,
          category: categoryLabel,
          expectedAnswer: 'Describe teamwork, communication, and how the project succeeded.',
          hints: ['Role clarity', 'Collaboration', 'Results'],
        },
      ],
      behavioral: [
        {
          questionText: `Describe a difficult decision you made when working with a ${categoryLabel}-focused team.`,
          category: categoryLabel,
          expectedAnswer: 'Explain the context, the decision process, and the outcome.',
          hints: ['Situation', 'Impact', 'Learnings'],
        },
      ],
    };

    const source = template[interviewType] || template.technical;
    return Array.from({ length: count }, (_, index) => {
      const item = source[index % source.length];
      return {
        ...item,
        difficulty,
        interviewType,
        tags: [difficulty, interviewType],
        orderNumber: index + 1,
        generatedByAI: false,
      };
    });
  }

  /**
   * Evaluate user answer and provide feedback
   */
  async evaluateAnswer(question, userAnswer, expectedAnswer, difficulty) {
    try {
      const prompt = `You are an expert interview evaluator. 
      
Question: "${question}"
Expected Answer: "${expectedAnswer}"
User's Answer: "${userAnswer}"
Difficulty Level: ${difficulty}

Please evaluate the user's answer on a scale of 0-100 and provide:
1. A score (0-100)
2. Detailed feedback about the answer
3. Key strengths (array of 2-3 points)
4. Areas for improvement (array of 2-3 points)
5. Suggestions for better answers (array of 2-3 points)

Respond with ONLY valid JSON with fields: score, feedback, strengths, areasForImprovement, suggestions. No other text.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = typeof response?.text === 'function' ? response.text() : String(response);

      // Extract JSON from response
      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const evaluation = JSON.parse(jsonText);

      return {
        score: Math.max(0, Math.min(100, evaluation.score || 0)),
        feedback: evaluation.feedback || 'Good effort! Keep practicing.',
        strengths: evaluation.strengths || [],
        areasForImprovement: evaluation.areasForImprovement || [],
        suggestions: evaluation.suggestions || [],
      };
    } catch (error) {
      console.error('Error evaluating answer:', error);
      // Return default evaluation on error
      return {
        score: 50,
        feedback: 'Unable to generate detailed feedback. Please try again.',
        strengths: [],
        areasForImprovement: [],
        suggestions: [],
      };
    }
  }

  async generateResumeInsights(parsedContent = {}, extractedSkills = [], roleMatch = [], keywordAnalysis = {}, atsScore = {}, industryMatch = {}) {
    if (!process.env.GEMINI_API_KEY) {
      return this.generateResumeInsightsFallback(parsedContent, extractedSkills, roleMatch, keywordAnalysis, atsScore, industryMatch);
    }

    try {
      const prompt = `You are an ATS resume expert and technical recruiter. Analyze the structured resume data and provide a concise recruiter-ready output.

Respond with ONLY valid JSON object, no surrounding text. Use the following fields:
- strengths: array of 3 to 5 points
- weaknesses: array of 3 to 5 points
- recommendations: array of 4 to 6 action-oriented improvements
- actionPlan: array of 4 to 6 sequential resume improvement steps
- industryFit: array of objects with { industry, matchScore } for the top 5 industries

Use the resume data and avoid repeating generic filler. Focus on technical resume quality, ATS optimization, role alignment, keyword precision, and project/achievement impact.
`;

      const payload = {
        summary: parsedContent.sections?.summary || '',
        personalInfo: parsedContent.sections?.personalInfo || {},
        education: parsedContent.sections?.education || [],
        experience: parsedContent.sections?.experience || [],
        projects: parsedContent.sections?.projects || [],
        skills: parsedContent.sections?.skills || [],
        certifications: parsedContent.sections?.certifications || [],
        achievements: parsedContent.sections?.achievements || [],
        links: parsedContent.sections?.links || {},
        topSkills: extractedSkills.slice(0, 20).map((s) => s.skill),
        topRole: roleMatch?.[0]?.role || 'General',
        roleMatch: roleMatch,
        keywordAnalysis: keywordAnalysis,
        atsScore: atsScore,
        industryMatch: industryMatch,
      };

      const textPrompt = `${prompt}\nResumeData:\n${JSON.stringify(payload, null, 2)}`;
      const result = await this.model.generateContent(textPrompt);
      const response = result.response;
      const text = typeof response?.text === 'function' ? response.text() : String(response);

      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const insights = JSON.parse(jsonText);
      return {
        strengths: Array.isArray(insights.strengths) ? insights.strengths : [],
        weaknesses: Array.isArray(insights.weaknesses) ? insights.weaknesses : [],
        recommendations: Array.isArray(insights.recommendations) ? insights.recommendations : [],
        actionPlan: Array.isArray(insights.actionPlan) ? insights.actionPlan : [],
        industryFit: Array.isArray(insights.industryFit) ? insights.industryFit : [],
      };
    } catch (error) {
      if (error.status === 429) {
        console.warn('Gemini API quota exceeded. Using fallback resume insights generation.');
      } else {
        console.error('Error generating resume insights:', error.message);
      }
      return this.generateResumeInsightsFallback(parsedContent, extractedSkills, roleMatch, keywordAnalysis, atsScore, industryMatch);
    }
  }

  generateResumeInsightsFallback(parsedContent = {}, extractedSkills = [], roleMatch = [], keywordAnalysis = {}, atsScore = {}, industryMatch = {}) {
    const baseStrengths = [];
    const baseWeaknesses = [];
    const baseRecommendations = [];
    const baseActionPlan = [];

    if (atsScore.score >= 80) {
      baseStrengths.push('Strong ATS alignment and resume structure');
    }
    if (parsedContent.sections?.skills?.length > 0) {
      baseStrengths.push('Relevant technical skills are clearly listed');
    }
    if (parsedContent.sections?.projects?.length >= 2) {
      baseStrengths.push('Multiple projects include technology and impact details');
    }
    if (parsedContent.sections?.achievements?.length > 0) {
      baseStrengths.push('Achievements and certifications contribute to credibility');
    }

    if (!parsedContent.sections?.personalInfo?.email || !parsedContent.sections?.personalInfo?.phone) {
      baseWeaknesses.push('Missing or incomplete contact information');
      baseRecommendations.push('Ensure email and phone are clearly visible in the resume header');
    }
    if ((parsedContent.sections?.education?.length || 0) === 0) {
      baseWeaknesses.push('Education section is not detected');
      baseRecommendations.push('Add degree, institution name, and expected or completed graduation date');
    }
    if ((parsedContent.sections?.skills?.length || 0) === 0) {
      baseWeaknesses.push('No skills section found');
      baseRecommendations.push('Add a concise technical skills section with relevant categories');
    }
    if ((parsedContent.sections?.projects?.length || 0) === 0) {
      baseWeaknesses.push('Projects are not captured');
      baseRecommendations.push('Document at least one project with technology stack and measurable outcome');
    }

    baseActionPlan.push('Review resume sections and make sure contact details are complete');
    baseActionPlan.push('Add or improve the skills section with target role keywords');
    baseActionPlan.push('Document projects with responsibilities, tools, and impact metrics');
    baseActionPlan.push('Highlight achievements, certifications, and awards relevant to the target role');

    const industryFit = Array.isArray(industryMatch.industries)
      ? industryMatch.industries.slice(0, 5)
      : [];

    return {
      strengths: baseStrengths,
      weaknesses: baseWeaknesses,
      recommendations: baseRecommendations,
      actionPlan: baseActionPlan,
      industryFit,
    };
  }

  /**
   * Generate overall interview feedback
   */
  async generateInterviewFeedback(interviewData) {
    try {
      const totalScore = interviewData.responses.reduce((sum, r) => sum + (r.aiEvaluation?.score || 0), 0) / interviewData.responses.length;
      const questions = interviewData.questions.map(q => q.questionText).join('\n- ');
      const responses = interviewData.responses.map(r => `Q: ${r.questionId.questionText}\nA: ${r.userAnswer}`).join('\n\n');

      const prompt = `You are an expert interview coach. Analyze this interview performance:

Interview Type: ${interviewData.interviewType}
Difficulty: ${interviewData.difficulty}
Total Score: ${totalScore.toFixed(2)}/100

Questions Asked:
- ${questions}

User's Responses:
${responses}

Please provide:
1. Overall performance assessment (2-3 paragraphs)
2. Top 3 strengths demonstrated
3. Top 3 areas for improvement
4. Specific action items for better performance
5. Topics to focus on for preparation

Respond with ONLY valid JSON with fields: overallAssessment, strengths, improvements, actionItems, topicsToFocus. No other text.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = typeof response?.text === 'function' ? response.text() : String(response);

      // Extract JSON from response
      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const feedback = JSON.parse(jsonText);

      return {
        overallAssessment: feedback.overallAssessment || 'Great effort! Continue practicing.',
        strengths: feedback.strengths || [],
        improvements: feedback.improvements || [],
        actionItems: feedback.actionItems || [],
        topicsToFocus: feedback.topicsToFocus || [],
      };
    } catch (error) {
      console.error('Error generating interview feedback:', error);
      return {
        overallAssessment: 'Unable to generate detailed feedback.',
        strengths: [],
        improvements: [],
        actionItems: [],
        topicsToFocus: [],
      };
    }
  }

  async evaluateCodeSubmission(sourceCode, language, challengeTitle, challengeDescription, passedCases, totalCases, outputs, compileOutput, stderr) {
    try {
      const prompt = `You are a programming coach and judge. Evaluate the submitted code for the following challenge.\n\nChallenge: ${challengeTitle}\nDescription: ${challengeDescription}\nLanguage: ${language}\n\nPassed Test Cases: ${passedCases}/${totalCases}\n\nExecution Output:\n${Array.isArray(outputs) ? outputs.join('\n---\n') : outputs || 'N/A'}\n\nCompiler Output: ${compileOutput || 'N/A'}\nStderr: ${stderr || 'N/A'}\n\nSource Code:\n${sourceCode}\n\nProvide ONLY valid JSON with the following fields:\n- scoreSummary\n- feedback\n- strengths\n- improvements\n- suggestions\n`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = typeof response?.text === 'function' ? response.text() : String(response);

      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const evaluation = JSON.parse(jsonText);

      return {
        scoreSummary: evaluation.scoreSummary || 'The submission has been evaluated based on the number of passing test cases and runtime behavior.',
        feedback: evaluation.feedback || 'The code executed, but there may be opportunities to improve correctness, readability, or performance.',
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        suggestions: evaluation.suggestions || [],
      };
    } catch (error) {
      console.error('Error evaluating code submission:', error);
      return {
        scoreSummary: 'Unable to generate detailed code feedback at this time.',
        feedback: 'The submission executed, but detailed AI feedback could not be generated.',
        strengths: [],
        improvements: [],
        suggestions: [],
      };
    }
  }

  /**
   * Generate follow-up questions based on user answer
   */
  async generateFollowUpQuestion(originalQuestion, userAnswer, difficulty) {
    try {
      const prompt = `Based on this interview answer, generate a thoughtful follow-up question:

Original Question: "${originalQuestion}"
User's Answer: "${userAnswer}"
Current Difficulty: ${difficulty}

The follow-up question should:
- Dig deeper into the user's understanding
- Test for practical experience
- Be at ${difficulty} or slightly higher difficulty
- Be relevant to the answer given

Respond with ONLY valid JSON with fields: followUpQuestion, category, expectedAnswer, hints (array). No other text.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = typeof response?.text === 'function' ? response.text() : String(response);

      // Extract JSON from response
      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const followUp = JSON.parse(jsonText);

      return {
        questionText: followUp.followUpQuestion || followUp.question || '',
        category: followUp.category || 'Follow-up',
        expectedAnswer: followUp.expectedAnswer || '',
        hints: followUp.hints || [],
        isFollowUp: true,
      };
    } catch (error) {
      console.error('Error generating follow-up question:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
