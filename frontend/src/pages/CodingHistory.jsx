import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getSubmissions } from '../features/coding/codingSlice';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CodingHistoryPage() {
  const dispatch = useDispatch();
  const { submissions, loading, error } = useSelector((state) => state.coding);

  useEffect(() => {
    dispatch(getSubmissions());
  }, [dispatch]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Submission History</h2>
          <p className="mt-2 text-sm text-slate-600">Review your latest challenge attempts, scores, and execution status.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/coding"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Continue Practice
          </Link>
          <Link
            to="/coding/analytics"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            View Analytics
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message || JSON.stringify(error)}</div>
        ) : submissions.length === 0 ? (
          <div className="text-slate-600">No submissions have been recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Link
                key={submission._id}
                to={`/coding/submissions/${submission._id}`}
                className="block rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-400 hover:bg-indigo-50"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{submission.challengeId?.title || 'Challenge'}</p>
                    <p className="text-sm text-slate-500">{submission.language} • {submission.passedCases}/{submission.totalCases} passed</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`rounded-full px-3 py-1 font-semibold ${
                      submission.status === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : submission.status === 'failed'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      Score: {submission.score || 0}%
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      {new Date(submission.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
