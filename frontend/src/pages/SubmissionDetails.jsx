import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSubmission } from '../features/coding/codingSlice';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SubmissionDetailsPage() {
  const { submissionId } = useParams();
  const dispatch = useDispatch();
  const { result, loading, error } = useSelector((state) => state.coding);

  useEffect(() => {
    if (submissionId) {
      dispatch(getSubmission(submissionId));
    }
  }, [dispatch, submissionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Link to="/coding/history" className="mb-4 inline-block text-indigo-600 hover:underline">
          ← Back to History
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message || JSON.stringify(error)}</div>
      </div>
    );
  }

  const submission = result;

  if (!submission) {
    return (
      <div className="container mx-auto p-4">
        <Link to="/coding/history" className="mb-4 inline-block text-indigo-600 hover:underline">
          ← Back to History
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No submission found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="container mx-auto p-4">
        <Link to="/coding/history" className="mb-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
          ← Back to History
        </Link>

        <div className="grid gap-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{submission.challengeId?.title || 'Challenge'}</h1>
                <p className="mt-2 text-sm text-slate-600">Submitted on {new Date(submission.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-3 text-right">
                <div>
                  <p className="text-sm text-slate-600">Language</p>
                  <p className="text-lg font-semibold text-slate-900">{submission.language}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className={`text-lg font-semibold ${submission.status === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {submission.status === 'success' ? '✓ Accepted' : '✗ Failed'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Submission Result</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Score</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{submission.score || 0}%</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Passed Tests</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">
                  {submission.passedCases || 0}/{submission.totalCases || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Execution Time</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{submission.executionTime || '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Memory Usage</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{submission.memory || '—'}</p>
              </div>
            </div>
          </div>

          {/* Test Case Results */}
          {submission.testCaseResults && submission.testCaseResults.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Test Case Results</h2>
              <div className="mt-6 space-y-4">
                {submission.testCaseResults.map((testCase, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border-2 p-4 ${
                      testCase.status === 'passed'
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl font-bold ${
                            testCase.status === 'passed' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {testCase.status === 'passed' ? '✓' : '✗'}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">Test Case {index + 1}</p>
                          <p className="text-sm text-slate-600">
                            {testCase.status === 'passed' ? 'Passed' : 'Failed'}
                          </p>
                        </div>
                      </div>
                      {testCase.isHidden && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold text-slate-700 uppercase">Input</p>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                          {testCase.input || '(empty)'}
                        </pre>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold text-slate-700 uppercase">Expected Output</p>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                          {testCase.expectedOutput || '(empty)'}
                        </pre>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold text-slate-700 uppercase">Actual Output</p>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                          {testCase.actualOutput || '(empty)'}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Code */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Submitted Code</h2>
            <pre className="mt-4 rounded-2xl border border-slate-200 bg-slate-900 p-4 overflow-x-auto text-sm text-slate-100">
              <code>{submission.sourceCode}</code>
            </pre>
          </div>

          {/* AI Feedback */}
          {submission.aiFeedback && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">AI Feedback</h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-slate-900">Summary</h3>
                  <p className="mt-2 text-sm text-slate-700">{submission.aiFeedback.feedback}</p>

                  {submission.aiFeedback.strengths && submission.aiFeedback.strengths.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-emerald-700">Strengths</h4>
                      <ul className="mt-2 space-y-2">
                        {submission.aiFeedback.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-slate-700">
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  {submission.aiFeedback.improvements && submission.aiFeedback.improvements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-rose-700">Areas for Improvement</h4>
                      <ul className="mt-2 space-y-2">
                        {submission.aiFeedback.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-sm text-slate-700">
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {submission.aiFeedback.suggestions && submission.aiFeedback.suggestions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-indigo-700">Suggestions</h4>
                      <ul className="mt-2 space-y-2">
                        {submission.aiFeedback.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-slate-700">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
