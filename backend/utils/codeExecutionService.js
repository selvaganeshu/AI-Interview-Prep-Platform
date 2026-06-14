/**
 * Code Execution Simulation Service
 * Simulates code execution and test case evaluation without actual code execution.
 * Compatible with future Judge0 integration.
 * 
 * For future integration with Judge0:
 * Replace simulateCodeRun and simulateSolutionSubmission implementations
 * while keeping the same function signatures and response format.
 */

/**
 * Generates challenge-specific mock output based on input
 * Supports Sum, Reverse String, Balanced Brackets, and other common challenges
 * @param {string} challengeTitle - The title of the challenge
 * @param {string} sourceCode - The submitted source code
 * @param {string} customInput - Custom input provided for testing
 * @returns {string} The simulated output
 */
const generateMockOutput = (challengeTitle = '', sourceCode = '', customInput = '') => {
  // If custom input is provided, try to process it intelligently
  if (customInput && customInput.trim()) {
    const challengeTitleLower = challengeTitle.toLowerCase();
    const inputLines = customInput.split('\n').filter((l) => l.trim());

    // Sum Two Numbers
    if (challengeTitleLower.includes('sum')) {
      try {
        if (inputLines.length >= 2) {
          const [a, b] = inputLines.map((x) => parseInt(x, 10));
          if (!isNaN(a) && !isNaN(b)) {
            return String(a + b);
          }
        }
      } catch (e) {
        // Fall through to default
      }
    }

    // Reverse a String
    if (challengeTitleLower.includes('reverse')) {
      const text = inputLines.join('\n');
      return text.split('').reverse().join('');
    }

    // Balanced Brackets
    if (challengeTitleLower.includes('balanced') || challengeTitleLower.includes('bracket')) {
      const text = inputLines.join('');
      const stack = [];
      const pairs = { '(': ')', '[': ']', '{': '}' };

      for (const char of text) {
        if (pairs[char]) {
          stack.push(char);
        } else if (Object.values(pairs).includes(char)) {
          const last = stack.pop();
          if (!last || pairs[last] !== char) {
            return 'false';
          }
        }
      }
      return stack.length === 0 ? 'true' : 'false';
    }

    // Fibonacci
    if (challengeTitleLower.includes('fib')) {
      try {
        const n = parseInt(inputLines[0], 10);
        if (n >= 0) {
          let a = 0, b = 1;
          for (let i = 0; i < n; i++) {
            [a, b] = [b, a + b];
          }
          return String(a);
        }
      } catch (e) {
        // Fall through
      }
    }

    // Factorial
    if (challengeTitleLower.includes('factorial')) {
      try {
        const n = parseInt(inputLines[0], 10);
        if (n >= 0) {
          let result = 1;
          for (let i = 2; i <= n; i++) {
            result *= i;
          }
          return String(result);
        }
      } catch (e) {
        // Fall through
      }
    }

    // Prime number check
    if (challengeTitleLower.includes('prime')) {
      try {
        const n = parseInt(inputLines[0], 10);
        if (n <= 1) return 'false';
        if (n === 2) return 'true';
        if (n % 2 === 0) return 'false';
        for (let i = 3; i * i <= n; i += 2) {
          if (n % i === 0) return 'false';
        }
        return 'true';
      } catch (e) {
        // Fall through
      }
    }

    // Palindrome check
    if (challengeTitleLower.includes('palindrome')) {
      const text = inputLines.join('').toLowerCase().replace(/[^a-z0-9]/g, '');
      return text === text.split('').reverse().join('') ? 'true' : 'false';
    }

    // Default: return the input as output
    return inputLines.join('\n');
  }

  // Without custom input, generate based on challenge title
  const challengeTitleLower = challengeTitle.toLowerCase();

  if (challengeTitleLower.includes('sum')) return '15';
  if (challengeTitleLower.includes('reverse')) return 'olleh';
  if (challengeTitleLower.includes('balanced') || challengeTitleLower.includes('bracket'))
    return 'true';
  if (challengeTitleLower.includes('fib')) return '5';
  if (challengeTitleLower.includes('factorial')) return '120';
  if (challengeTitleLower.includes('prime')) return 'true';
  if (challengeTitleLower.includes('palindrome')) return 'true';

  // Default output for unknown challenges
  return 'Code Executed Successfully';
};

const evaluateTestCases = (testCases, sourceCode, customInput, challengeTitle = '') => {
  if (!testCases || testCases.length === 0) {
    return { results: [], passedCount: 0, totalCount: 0 };
  }

  const results = testCases.map((testCase) => {
    let actualOutput;

    if (testCase.input && testCase.input.trim()) {
      actualOutput = generateMockOutput(challengeTitle, sourceCode, testCase.input);
    } else {
      actualOutput = generateMockOutput(challengeTitle, sourceCode, '');
    }

    // Check if output matches expected (trim whitespace for comparison)
    const isPassed = actualOutput.trim() === String(testCase.expectedOutput).trim();

    return {
      input: testCase.input || '',
      expectedOutput: testCase.expectedOutput || '',
      actualOutput,
      status: isPassed ? 'passed' : 'failed',
      isHidden: testCase.hidden || false,
    };
  });

  const passedCount = results.filter((r) => r.status === 'passed').length;
  const totalCount = results.length;

  return { results, passedCount, totalCount };
};

const generateExecutionSummary = (passedTests, totalTests, language) => {
  // Calculate execution time (in milliseconds) and memory (in MB) as numbers
  const executionTimeMs = Math.floor(Math.random() * 200 + 50); // 50-250ms
  const memoryMb = Math.floor(Math.random() * 20 + 8); // 8-28 MB

  const status =
    passedTests === totalTests
      ? 'Accepted'
      : passedTests > 0
        ? 'Partially Accepted'
        : 'Failed';

  return {
    status,
    executionTime: executionTimeMs,
    memory: memoryMb,
    passedTests,
    totalTests,
  };
};

const generateAIFeedback = (testResults, language, passedTests, totalTests) => {
  const strengths = [];
  const improvements = [];

  if (passedTests === totalTests) {
    strengths.push('✓ All test cases passed');
    strengths.push('✓ Efficient solution');
  } else if (passedTests > 0) {
    strengths.push('✓ Partial correctness achieved');
    strengths.push('✓ Basic logic implemented');
    improvements.push('✗ Edge cases not handled');
    improvements.push('✗ Logic needs refinement');
  } else {
    improvements.push('✗ Solution does not produce expected output');
    improvements.push('✗ Check input/output format');
  }

  const suggestions = [];
  if (testResults && testResults.length > 0) {
    const failedCases = testResults.filter((r) => r.status === 'failed');
    if (failedCases.length > 0) {
      suggestions.push('Review test case inputs and expected outputs');
      suggestions.push(`Debug failed test cases: ${failedCases.length}/${testResults.length}`);
    }
  }

  suggestions.push(`Practice more ${language} problems`);
  suggestions.push('Improve edge case handling');

  const score = passedTests === totalTests ? 100 : Math.floor((passedTests / totalTests) * 100);
  const scoreSummary =
    score === 100
      ? 'Perfect! All test cases passed.'
      : score >= 50
        ? `Good attempt! ${score}% of test cases passed.`
        : `Keep practicing! ${score}% of test cases passed.`;

  return {
    scoreSummary,
    feedback: `Your solution ${passedTests === totalTests ? 'is correct!' : 'needs improvement.'}`,
    strengths,
    improvements,
    suggestions,
  };
};

/**
 * Simulates code execution and returns output with execution metadata
 * 
 * @param {string} sourceCode - The code to execute
 * @param {string} language - Programming language
 * @param {string} customInput - Input for the program
 * @param {string} challengeTitle - Title of the challenge (optional)
 * @returns {Promise<Object>} Result with output, status, execution time, and memory
 */
const simulateCodeRun = async (sourceCode, language, customInput = '', challengeTitle = '') => {
  // Simulate execution delay (50-500ms)
  await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 450 + 50)));

  const output = generateMockOutput(challengeTitle, sourceCode, customInput);
  const executionTimeMs = Math.floor(Math.random() * 150 + 50); // 50-200ms
  const memoryMb = Math.floor(Math.random() * 15 + 8); // 8-23 MB

  return {
    success: true,
    output,
    status: 'Accepted',
    executionTime: executionTimeMs,
    memory: memoryMb,
    language,
  };
};

/**
 * Simulates solution submission and evaluation against test cases
 * 
 * @param {string} sourceCode - The submitted code
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of test cases with input and expectedOutput
 * @param {string} challengeTitle - Title of the challenge
 * @returns {Promise<Object>} Evaluation result with test results and AI feedback
 */
const simulateSolutionSubmission = async (sourceCode, language, testCases, challengeTitle = '') => {
  // Simulate evaluation delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Evaluate test cases
  const { results: testCaseResults, passedCount, totalCount } = evaluateTestCases(
    testCases,
    sourceCode,
    null,
    challengeTitle
  );

  // Generate execution summary
  const executionSummary = generateExecutionSummary(passedCount, totalCount, language);

  // Calculate score
  const score = totalCount > 0 ? Math.floor((passedCount / totalCount) * 100) : 0;

  // Generate AI feedback
  const feedback = generateAIFeedback(testCaseResults, language, passedCount, totalCount);

  return {
    success: true,
    testCaseResults,
    passedTests: passedCount,
    totalTests: totalCount,
    score,
    status: executionSummary.status,
    executionTime: executionSummary.executionTime,
    memory: executionSummary.memory,
    feedback,
    submission: {
      sourceCode,
      language,
      score,
      status: executionSummary.status,
      passedTests: passedCount,
      totalTests: totalCount,
      testCaseResults,
      executionSummary,
      feedback,
    },
  };
};

module.exports = {
  simulateCodeRun,
  simulateSolutionSubmission,
  generateAIFeedback,
  generateExecutionSummary,
  evaluateTestCases,
};
