const asyncHandler = require('../utils/asyncHandler');
const CodingChallenge = require('../models/CodingChallenge');
const CodingSubmission = require('../models/CodingSubmission');
const CodeExecutionHistory = require('../models/CodeExecutionHistory');
const codeExecutionService = require('../utils/codeExecutionService');
const aiService = require('../utils/aiService');

const defaultChallenges = [
  {
    title: 'Sum of Two Numbers',
    description: 'Write a function that reads two numbers from input and prints their sum.',
    difficulty: 'Easy',
    categories: ['Algorithms', 'Math'],
    languageOptions: ['javascript', 'python', 'java', 'cpp'],
    defaultLanguage: 'javascript',
    starterCode: {
      javascript: 'function solve() {\n  const input = globalThis.prompt?.() || \"1 2\";\n  const [a, b] = input.split(/\s+/).map(Number);\n  console.log(a + b);\n}\n\nsolve();\n',
      python: 'def solve():\n    data = input().split()\n    a, b = map(int, data)\n    print(a + b)\n\nif __name__ == \"__main__\":\n    solve()\n',
      java: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner scanner = new Scanner(System.in);\n    int a = scanner.nextInt();\n    int b = scanner.nextInt();\n    System.out.println(a + b);\n  }\n}\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  int a, b;\n  cin >> a >> b;\n  cout << a + b << endl;\n  return 0;\n}\n',
    },
    timeLimit: 20,
    maxScore: 100,
    testCases: [
      { input: '1 2', expectedOutput: '3' },
      { input: '10 20', expectedOutput: '30' },
      { input: '-5 5', expectedOutput: '0' },
    ],
    tags: ['basic', 'math'],
  },
  {
    title: 'Reverse a String',
    description: 'Read a single line of text and print the reversed string.',
    difficulty: 'Medium',
    categories: ['Strings', 'Algorithms'],
    languageOptions: ['javascript', 'python', 'java', 'cpp'],
    defaultLanguage: 'javascript',
    starterCode: {
      javascript: 'function solve() {\n  const input = globalThis.prompt?.() || \"hello\";\n  const result = input.split(\"\").reverse().join(\"\");\n  console.log(result);\n}\n\nsolve();\n',
      python: 'def solve():\n    text = input().strip()\n    print(text[::-1])\n\nif __name__ == \"__main__\":\n    solve()\n',
      java: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner scanner = new Scanner(System.in);\n    String text = scanner.nextLine();\n    StringBuilder sb = new StringBuilder(text);\n    System.out.println(sb.reverse());\n  }\n}\n',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  string text;\n  getline(cin, text);\n  reverse(text.begin(), text.end());\n  cout << text << endl;\n  return 0;\n}\n',
    },
    timeLimit: 20,
    maxScore: 100,
    testCases: [
      { input: 'hello', expectedOutput: 'olleh' },
      { input: 'AI Prep', expectedOutput: 'perP IA' },
      { input: 'abc123', expectedOutput: '321cba' },
    ],
    tags: ['strings', 'medium'],
  },
  {
    title: 'Balanced Brackets',
    description: 'Verify if the brackets in the input are balanced. Print true or false.',
    difficulty: 'Hard',
    categories: ['Data Structures', 'Algorithms'],
    languageOptions: ['javascript', 'python', 'java', 'cpp'],
    defaultLanguage: 'javascript',
    starterCode: {
      javascript: 'function isBalanced(str) {\n  const stack = []\n  const pairs = {\"()\": true, \"[]\": true, \"{}\": true};\n  for (const ch of str) {\n    if (ch === \"(\" || ch === \"[\" || ch === \"{\") stack.push(ch);\n    else if (ch === \")\" || ch === \"]\" || ch === \"}\") {\n      const last = stack.pop();\n      if (!last || !pairs[last + ch]) return false;\n    }\n  }\n  return stack.length === 0;\n}\n\nfunction solve() {\n  const input = globalThis.prompt?.() || \"()[]{}\";\n  console.log(isBalanced(input));\n}\n\nsolve();\n',
      python: 'def is_balanced(text):\n    stack = []\n    pairs = {\"(\": \")\", \"[\": \"]\", \"{\": \"}\"}\n    for ch in text:\n        if ch in pairs:\n            stack.append(ch)\n        elif ch in pairs.values():\n            if not stack or pairs[stack.pop()] != ch:\n                return False\n    return len(stack) == 0\n\nif __name__ == \"__main__\":\n    print(is_balanced(input().strip()))\n',
      java: "import java.util.*;\npublic class Main {\n  public static boolean isBalanced(String s) {\n    Deque<Character> stack = new ArrayDeque<>();\n    for (char ch : s.toCharArray()) {\n      if (ch == '(' || ch == '[' || ch == '{') stack.push(ch);\n      else if (ch == ')' || ch == ']' || ch == '}') {\n        if (stack.isEmpty()) return false;\n        char top = stack.pop();\n        if ((ch == ')' && top != '(') || (ch == ']' && top != '[') || (ch == '}' && top != '{')) return false;\n      }\n    }\n    return stack.isEmpty();\n  }\n  public static void main(String[] args) {\n    Scanner scanner = new Scanner(System.in);\n    System.out.println(isBalanced(scanner.nextLine().trim()));\n  }\n}\n",
      cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  string text;\n  getline(cin, text);\n  vector<char> stack;\n  for (char ch : text) {\n    if (ch == '(' || ch == '[' || ch == '{') stack.push_back(ch);\n    else if (ch == ')' || ch == ']' || ch == '}') {\n      if (stack.empty()) { cout << boolalpha << false << endl; return 0; }\n      char last = stack.back(); stack.pop_back();\n      if ((ch == ')' && last != '(') || (ch == ']' && last != '[') || (ch == '}' && last != '{')) { cout << boolalpha << false << endl; return 0; }\n    }\n  }\n  cout << boolalpha << (stack.empty()) << endl;\n  return 0;\n}\n",
    },
    timeLimit: 20,
    maxScore: 100,
    testCases: [
      { input: '()[]{}', expectedOutput: 'true' },
      { input: '([{}])', expectedOutput: 'true' },
      { input: '([)]', expectedOutput: 'false' },
    ],
    tags: ['hard', 'brackets'],
  },
];

async function seedDefaultChallenges() {
  const count = await CodingChallenge.countDocuments();
  if (count === 0) {
    await CodingChallenge.insertMany(defaultChallenges);
  }
}

exports.getChallenges = asyncHandler(async (req, res) => {
  await seedDefaultChallenges();
  const challenges = await CodingChallenge.find().sort({ difficulty: 1, title: 1 });
  res.status(200).json({ success: true, data: challenges });
});

exports.getChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const challenge = await CodingChallenge.findById(challengeId);

  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  res.status(200).json({ success: true, data: challenge });
});

exports.createChallenge = asyncHandler(async (req, res) => {
  const { title, description, difficulty, categories, languageOptions, defaultLanguage, starterCode, timeLimit, maxScore, testCases, tags } = req.body;

  if (!title || !difficulty || !Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({ success: false, message: 'Title, difficulty, and at least one test case are required' });
  }

  const challenge = await CodingChallenge.create({
    title: title.trim(),
    description: description || '',
    difficulty,
    categories: Array.isArray(categories) ? categories : [],
    languageOptions: Array.isArray(languageOptions) ? languageOptions : ['javascript', 'python', 'java'],
    defaultLanguage: defaultLanguage || 'javascript',
    starterCode: starterCode || {},
    timeLimit: Number(timeLimit) || 20,
    maxScore: Number(maxScore) || 100,
    testCases: testCases.map((testCase) => ({
      input: String(testCase.input || '').trim(),
      expectedOutput: String(testCase.expectedOutput || '').trim(),
      hidden: Boolean(testCase.hidden),
    })),
    tags: Array.isArray(tags) ? tags : [],
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: challenge });
});

exports.updateChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const { title, description, difficulty, categories, languageOptions, defaultLanguage, starterCode, timeLimit, maxScore, testCases, tags } = req.body;

  const challenge = await CodingChallenge.findById(challengeId);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  challenge.title = title?.trim() || challenge.title;
  challenge.description = description ?? challenge.description;
  challenge.difficulty = difficulty || challenge.difficulty;
  challenge.categories = Array.isArray(categories) ? categories : challenge.categories;
  challenge.languageOptions = Array.isArray(languageOptions) ? languageOptions : challenge.languageOptions;
  challenge.defaultLanguage = defaultLanguage || challenge.defaultLanguage;
  challenge.starterCode = starterCode || challenge.starterCode;
  challenge.timeLimit = Number(timeLimit) || challenge.timeLimit;
  challenge.maxScore = Number(maxScore) || challenge.maxScore;
  challenge.tags = Array.isArray(tags) ? tags : challenge.tags;

  if (Array.isArray(testCases) && testCases.length > 0) {
    challenge.testCases = testCases.map((testCase) => ({
      input: String(testCase.input || '').trim(),
      expectedOutput: String(testCase.expectedOutput || '').trim(),
      hidden: Boolean(testCase.hidden),
    }));
  }

  await challenge.save();

  res.status(200).json({ success: true, data: challenge });
});

exports.deleteChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const challenge = await CodingChallenge.findById(challengeId);

  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  await challenge.remove();

  res.status(200).json({ success: true, message: 'Challenge deleted successfully' });
});

exports.runCode = asyncHandler(async (req, res) => {
  const { sourceCode, language, stdin, challengeId } = req.body;

  if (!sourceCode || !language) {
    return res.status(400).json({ success: false, message: 'Source code and language are required.' });
  }

  let challengeTitle = 'Unknown Challenge';
  let executionChallenge = null;

  // If challengeId is provided, fetch the challenge details
  if (challengeId) {
    executionChallenge = await CodingChallenge.findById(challengeId);
    if (executionChallenge) {
      challengeTitle = executionChallenge.title;
    }
  }

  // Execute the code with challenge context
  const result = await codeExecutionService.simulateCodeRun(
    sourceCode,
    language,
    stdin || '',
    challengeTitle
  );

  // Store execution history in MongoDB
  const executionHistory = await CodeExecutionHistory.create({
    userId: req.user._id,
    challengeId: challengeId || null,
    language,
    sourceCode,
    input: stdin || '',
    output: result.output,
    status: result.status,
    executionTime: result.executionTime,
    memory: result.memory,
    challengeTitle,
  });

  res.status(200).json({
    success: true,
    data: {
      output: result.output,
      status: result.status,
      executionTime: result.executionTime,
      memory: result.memory,
      language: result.language,
      historyId: executionHistory._id,
      challengeTitle,
    },
  });
});

exports.submitSolution = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const { sourceCode, language, timeTaken } = req.body;

  // Validate required fields
  if (!sourceCode || typeof sourceCode !== 'string' || sourceCode.trim() === '') {
    return res.status(400).json({ success: false, message: 'Source code is required and cannot be empty.' });
  }

  if (!language || typeof language !== 'string' || language.trim() === '') {
    return res.status(400).json({ success: false, message: 'Programming language is required.' });
  }

  const challenge = await CodingChallenge.findById(challengeId);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  const submission = await CodingSubmission.create({
    challengeId: challenge._id,
    userId: req.user._id,
    language,
    sourceCode,
    status: 'pending',
    totalCases: challenge.testCases.length,
    timeTaken: Number(timeTaken) || 0,
  });

  try {
    // Simulate solution evaluation with challenge title
    const evaluationResult = await codeExecutionService.simulateSolutionSubmission(
      sourceCode,
      language,
      challenge.testCases,
      challenge.title
    );

    // Update submission with results
    submission.status = evaluationResult.status.includes('Accepted') ? 'success' : evaluationResult.status === 'Failed' ? 'failed' : 'success';
    submission.score = evaluationResult.score;
    submission.passedCases = evaluationResult.passedTests;
    submission.totalCases = evaluationResult.totalTests;
    submission.testCaseResults = evaluationResult.testCaseResults;
    submission.executionTime = evaluationResult.executionTime;
    submission.memory = evaluationResult.memory;
    submission.aiFeedback = evaluationResult.feedback;
    submission.executionSummary = {
      status: evaluationResult.status,
      stdout: evaluationResult.testCaseResults.map((r) => r.actualOutput),
    };

    await submission.save();

    res.status(200).json({
      success: true,
      data: {
        submission: {
          _id: submission._id,
          challengeId: submission.challengeId,
          language: submission.language,
          score: submission.score,
          status: submission.status,
          passedCases: submission.passedCases,
          totalCases: submission.totalCases,
          testCaseResults: submission.testCaseResults,
          aiFeedback: submission.aiFeedback,
          executionTime: submission.executionTime,
          memory: submission.memory,
          createdAt: submission.createdAt,
        },
        summary: {
          passedCases: evaluationResult.passedTests,
          totalCases: evaluationResult.totalTests,
          score: evaluationResult.score,
          status: evaluationResult.status,
        },
        feedback: evaluationResult.feedback,
      },
    });
  } catch (error) {
    submission.status = 'failed';
    submission.executionSummary = { error: error.message };
    await submission.save();

    res.status(500).json({
      success: false,
      message: error.message || 'Code evaluation failed',
    });
  }
});

exports.getUserSubmissions = asyncHandler(async (req, res) => {
  const submissions = await CodingSubmission.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('challengeId', 'title difficulty');

  res.status(200).json({ success: true, data: submissions });
});

exports.getCodingAnalytics = asyncHandler(async (req, res) => {
  const totalChallenges = await CodingChallenge.countDocuments();
  const solvedChallengeCountResult = await CodingSubmission.aggregate([
    { $match: { userId: req.user._id, status: 'success' } },
    { $group: { _id: '$challengeId' } },
    { $count: 'count' },
  ]);

  const scoreResult = await CodingSubmission.aggregate([
    { $match: { userId: req.user._id } },
    { $group: {
      _id: null,
      averageScore: { $avg: '$score' },
      successRate: { $avg: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
    } },
  ]);

  const languageUsage = await CodingSubmission.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: '$language', count: { $sum: 1 } } },
    { $project: { _id: 0, language: '$_id', count: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalChallenges,
      solvedChallenges: solvedChallengeCountResult[0]?.count || 0,
      successRate: scoreResult[0] ? Math.round(scoreResult[0].successRate * 100) : 0,
      averageScore: scoreResult[0] ? Math.round(scoreResult[0].averageScore) : 0,
      languageUsage,
    },
  });
});

exports.getAllSubmissions = asyncHandler(async (req, res) => {
  const submissions = await CodingSubmission.find()
    .sort({ createdAt: -1 })
    .populate('challengeId', 'title difficulty')
    .populate('userId', 'name email');

  res.status(200).json({ success: true, data: submissions });
});

exports.getSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const submission = await CodingSubmission.findById(submissionId).populate('challengeId', 'title difficulty description');

  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  if (submission.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this submission' });
  }

  res.status(200).json({ success: true, data: submission });
});

exports.getExecutionHistory = asyncHandler(async (req, res) => {
  const { limit = 20, skip = 0 } = req.query;

  const executionHistory = await CodeExecutionHistory.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .skip(parseInt(skip, 10))
    .populate('challengeId', 'title difficulty');

  const total = await CodeExecutionHistory.countDocuments({ userId: req.user._id });

  res.status(200).json({
    success: true,
    data: executionHistory,
    pagination: {
      total,
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
    },
  });
});

exports.getExecutionHistoryByChallengeId = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const { limit = 20, skip = 0 } = req.query;

  const executionHistory = await CodeExecutionHistory.find({
    userId: req.user._id,
    challengeId,
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .skip(parseInt(skip, 10));

  const total = await CodeExecutionHistory.countDocuments({
    userId: req.user._id,
    challengeId,
  });

  res.status(200).json({
    success: true,
    data: executionHistory,
    pagination: {
      total,
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
    },
  });
});

exports.deleteExecutionHistory = asyncHandler(async (req, res) => {
  const { historyId } = req.params;

  const history = await CodeExecutionHistory.findById(historyId);
  if (!history) {
    return res.status(404).json({ success: false, message: 'Execution history not found' });
  }

  if (history.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this history' });
  }

  await CodeExecutionHistory.findByIdAndDelete(historyId);

  res.status(200).json({ success: true, message: 'Execution history deleted successfully' });
});
