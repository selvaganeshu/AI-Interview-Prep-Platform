const { URL } = require('url');

const DEFAULT_JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';
const DEFAULT_JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';

const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  'c++': 54,
  typescript: 74,
  go: 60,
  ruby: 72,
};

const fetch = (...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args));

class Judge0Service {
  getLanguageId(language = 'javascript') {
    const key = String(language || 'javascript').toLowerCase();
    return languageMap[key] || languageMap.javascript;
  }

  getJudge0Url() {
    return process.env.JUDGE0_URL || DEFAULT_JUDGE0_URL;
  }

  getJudge0ApiKey() {
    return process.env.JUDGE0_API_KEY || '';
  }

  getJudge0ApiHost() {
    return process.env.JUDGE0_API_HOST || DEFAULT_JUDGE0_API_HOST;
  }

  async submitCode({ sourceCode, language, testCases = [], timeLimitSeconds = 5 }) {
    const languageId = this.getLanguageId(language);
    const judge0Url = this.getJudge0Url();
    const judge0ApiKey = this.getJudge0ApiKey();
    const judge0ApiHost = this.getJudge0ApiHost();

    const url = new URL('/submissions', judge0Url);
    url.searchParams.set('base64_encoded', 'false');
    url.searchParams.set('wait', 'true');

    if (judge0Url.includes('rapidapi') && !judge0ApiKey) {
      throw new Error('Judge0 RapidAPI key is not configured. Set JUDGE0_API_KEY in your .env or configure a self-hosted Judge0 URL in JUDGE0_URL.');
    }

    const body = {
      source_code: sourceCode,
      language_id: languageId,
      stdin: testCases.map((testCase) => String(testCase.input || '')),
      expected_output: testCases.map((testCase) => String(testCase.expectedOutput || '')),
      redirect_stderr_to_stdout: true,
      cpu_time_limit: String(timeLimitSeconds),
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    if (judge0ApiKey) {
      headers['X-RapidAPI-Key'] = judge0ApiKey;
    }
    if (judge0ApiHost) {
      headers['X-RapidAPI-Host'] = judge0ApiHost;
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Judge0 submission failed');
    }

    return data;
  }

  async runCode({ sourceCode, language, stdin = '', timeLimitSeconds = 5 }) {
    const languageId = this.getLanguageId(language);
    const judge0Url = this.getJudge0Url();
    const judge0ApiKey = this.getJudge0ApiKey();
    const judge0ApiHost = this.getJudge0ApiHost();

    const url = new URL('/submissions', judge0Url);
    url.searchParams.set('base64_encoded', 'false');
    url.searchParams.set('wait', 'true');

    if (judge0Url.includes('rapidapi') && !judge0ApiKey) {
      throw new Error('Judge0 RapidAPI key is not configured. Set JUDGE0_API_KEY in your .env or configure a self-hosted Judge0 URL in JUDGE0_URL.');
    }

    const body = {
      source_code: sourceCode,
      language_id: languageId,
      stdin: String(stdin || ''),
      redirect_stderr_to_stdout: true,
      cpu_time_limit: String(timeLimitSeconds),
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    if (judge0ApiKey) {
      headers['X-RapidAPI-Key'] = judge0ApiKey;
    }
    if (judge0ApiHost) {
      headers['X-RapidAPI-Host'] = judge0ApiHost;
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Judge0 run failed');
    }

    return data;
  }

  async parseResult(result, testCases) {
    const totalCases = testCases.length;
    const expectedOutputs = testCases.map((testCase) => String(testCase.expectedOutput || '').trim());
    let passedCases = 0;
    let outputs = [];

    if (Array.isArray(result.stdout)) {
      outputs = result.stdout.map((item) => String(item || '').trim());
      passedCases = outputs.reduce((count, output, index) => {
        return count + (output === expectedOutputs[index] ? 1 : 0);
      }, 0);
    } else {
      const stdout = String(result.stdout || '').trim();
      outputs = [stdout];
      if (result.status?.id === 3 && totalCases === 1) {
        passedCases = expectedOutputs[0] === stdout ? 1 : 0;
      } else if (result.status?.id === 3 && totalCases > 1) {
        passedCases = totalCases;
      }
    }

    const baseScore = totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;
    const status = result.status?.id === 3 ? 'success' : 'failed';

    return {
      totalCases,
      passedCases,
      status,
      score: baseScore,
      outputs,
      raw: result,
    };
  }
}

module.exports = new Judge0Service();
