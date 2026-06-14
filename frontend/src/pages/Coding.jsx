import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getChallenges,
  getSubmissions,
  runCode,
  submitSolution,
  setSelectedChallenge,
  clearResult,
} from '../features/coding/codingSlice';
import CodeEditor from '../components/CodeEditor';

const languageLabels = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  typescript: 'TypeScript',
};

export default function CodingPage() {
  const dispatch = useDispatch();
  const { challenges, selectedChallenge, submissions, result, runResult, loading, runLoading, error } = useSelector((state) => state.coding);
  const [language, setLanguage] = useState('javascript');
  const [sourceCode, setSourceCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [lastMessage, setLastMessage] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    dispatch(getChallenges());
    dispatch(getSubmissions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedChallenge) {
      setLanguage(selectedChallenge.defaultLanguage || selectedChallenge.languageOptions?.[0] || 'javascript');
      setSourceCode(
        selectedChallenge.starterCode?.[selectedChallenge.defaultLanguage] ||
          selectedChallenge.starterCode?.[selectedChallenge.languageOptions?.[0]] ||
          ''
      );
      setSecondsLeft((selectedChallenge.timeLimit || 20) * 60);
      setExpired(false);
      setLastMessage('');
      setStdin('');
      dispatch(clearResult());
    }
  }, [dispatch, selectedChallenge]);

  useEffect(() => {
    if (!selectedChallenge) {
      return undefined;
    }

    if (secondsLeft <= 0) {
      setExpired(true);
      return undefined;
    }

    const timer = setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedChallenge, secondsLeft]);

  const formattedTime = useMemo(() => {
    const minutes = String(Math.max(Math.floor(secondsLeft / 60), 0)).padStart(2, '0');
    const seconds = String(Math.max(secondsLeft % 60, 0)).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const handleSelectChallenge = (challenge) => {
    dispatch(setSelectedChallenge(challenge));
  };

  const handleLanguageChange = (selected) => {
    setLanguage(selected);
    if (selectedChallenge?.starterCode?.[selected]) {
      setSourceCode(selectedChallenge.starterCode[selected]);
    }
  };

  const handleRun = async () => {
    if (!sourceCode || sourceCode.trim() === '') {
      setLastMessage('Please write some code before running.');
      return;
    }

    setLastMessage('Running code...');
    const action = await dispatch(
      runCode({
        sourceCode,
        language,
        stdin,
        challengeId: selectedChallenge?._id || null,
        timeLimit: selectedChallenge?.timeLimit || 5,
      })
    );

    if (action.error) {
      setLastMessage(`Error: ${action.payload || 'Run failed'}`);
    } else {
      setLastMessage('Run completed. Check output below.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedChallenge) {
      setLastMessage('Please select a challenge first.');
      return;
    }

    if (!sourceCode || sourceCode.trim() === '') {
      setLastMessage('Please write some code before submitting.');
      return;
    }

    const timeTaken = (selectedChallenge.timeLimit || 20) * 60 - secondsLeft;
    setLastMessage('Submitting code...');

    const action = await dispatch(
      submitSolution({
        challengeId: selectedChallenge._id,
        sourceCode,
        language,
        timeTaken,
      })
    );

    if (action.error) {
      setLastMessage(`Error: ${action.payload || 'Submission failed'}`);
    } else {
      setLastMessage('Submission complete. Review the feedback panel below.');
    }
  };

  const activeChallenge = selectedChallenge || challenges[0] || null;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-4">Coding Assessment</h2>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Challenges</h3>
            {challenges.map((challenge) => (
              <button
                key={challenge._id}
                type="button"
                onClick={() => handleSelectChallenge(challenge)}
                className={`w-full text-left rounded-lg px-3 py-3 mb-2 border ${
                  activeChallenge?._id === challenge._id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'
                } hover:border-indigo-400`}
              >
                <div className="font-medium">{challenge.title}</div>
                <div className="text-sm text-slate-500">{challenge.difficulty} • {challenge.languageOptions.join(', ')}</div>
              </button>
            ))}
            {!challenges.length && <p className="text-sm text-slate-500">Loading challenges...</p>}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">Submission History</h3>
              <Link to="/coding/history" className="text-sm font-medium text-indigo-600 hover:underline">
                View all
              </Link>
            </div>
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.slice(0, 5).map((submission) => (
                  <div key={submission._id} className="rounded-xl border border-slate-200 p-3 bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">{submission.challengeId?.title || 'Challenge'}</div>
                        <div className="text-xs text-slate-500">{submission.language} • {submission.passedCases}/{submission.totalCases} passed</div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${submission.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {submission.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No submissions yet. Start a challenge to see results.</p>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">{activeChallenge?.title || 'Select a coding challenge'}</h3>
                <div className="text-sm text-slate-600 mt-1">{activeChallenge?.difficulty || ''} • Time limit: {activeChallenge?.timeLimit || 20} min</div>
              </div>
              {activeChallenge && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{activeChallenge.categories?.join(', ')}</span>
                  <Link
                    to="/coding/history"
                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    View History
                  </Link>
                </div>
              )}
            </div>

            {activeChallenge ? (
              <>
                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-700">
                  <p className="whitespace-pre-line">{activeChallenge.description}</p>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="grid gap-3">
                    <div className="flex flex-wrap gap-2">
                      {activeChallenge.languageOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleLanguageChange(option)}
                          className={`rounded-full px-4 py-2 text-sm font-medium ${
                            language === option ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {languageLabels[option] || option}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="font-medium text-slate-700">Timer</div>
                        <div className="mt-2 text-3xl font-semibold tracking-tight">{formattedTime}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="font-medium text-slate-700">Score</div>
                        <div className="mt-2 text-3xl font-semibold tracking-tight">{result?.summary?.score ?? '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <CodeEditor language={language} value={sourceCode} onChange={setSourceCode} />
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-medium text-slate-700">Custom Input</div>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      placeholder="Enter custom input for the run"
                      className="mt-3 min-h-[140px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleRun}
                      className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading || runLoading}
                    >
                      Run Code
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading || runLoading}
                    >
                      Submit Solution
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="font-semibold text-slate-700">Execution Summary</div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div>Language: {languageLabels[language]}</div>
                      <div>Status: {runResult?.status || result?.summary?.status || 'Not run yet'}</div>
                      <div>Execution Time: {runResult?.executionTime ? `${runResult.executionTime}ms` : '—'}</div>
                      <div>Memory: {runResult?.memory ? `${runResult.memory} MB` : '—'}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="font-semibold text-slate-700">Output</div>
                    <pre className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap break-words text-sm text-slate-600">
                      {runResult?.output || result?.submission?.executionSummary?.stdout?.join('\n') || 'Run code or submit to see output here.'}
                    </pre>
                  </div>
                </div>

                {lastMessage && (
                  <div className={`mt-4 rounded-2xl border p-4 text-sm ${
                    lastMessage.startsWith('Error:')
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}>
                    {lastMessage}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">Choose a challenge from the list to begin.</div>
            )}
          </div>

          {result && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">Latest Submission Feedback</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="font-medium text-slate-700">Result</div>
                  <p className="mt-2 text-sm text-slate-600">{result.summary?.status || 'Unknown'}</p>
                  <div className="mt-3 text-sm text-slate-600">Passed cases: {result.summary?.passedCases}/{result.summary?.totalCases}</div>
                  <div className="mt-2 text-sm text-slate-600">Score: {result.summary?.score}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="font-medium text-slate-700">AI Feedback</div>
                  <div className="mt-3 space-y-3 text-sm text-slate-600">
                    <p>{result.feedback?.feedback}</p>
                    {result.feedback?.strengths?.length > 0 && (
                      <div>
                        <div className="font-semibold">Strengths</div>
                        <ul className="list-disc pl-5">
                          {result.feedback.strengths.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.feedback?.improvements?.length > 0 && (
                      <div>
                        <div className="font-semibold">Improvements</div>
                        <ul className="list-disc pl-5">
                          {result.feedback.improvements.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message || JSON.stringify(error)}</div>}
        </div>
      </div>
    </div>
  );
}
