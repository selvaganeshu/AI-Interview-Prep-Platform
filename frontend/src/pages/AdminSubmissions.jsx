import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import codingApi from '../services/codingApi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchUser, setSearchUser] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await codingApi.getAllSubmissions();
      const payload = response.data?.data;
      setSubmissions(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load submissions.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
      const matchesUser =
        searchUser === '' ||
        submission.userId?.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
        submission.userId?.email?.toLowerCase().includes(searchUser.toLowerCase());
      return matchesStatus && matchesUser;
    });
  }, [submissions, filterStatus, searchUser]);

  const stats = useMemo(() => {
    if (submissions.length === 0) {
      return {
        totalSubmissions: 0,
        successRate: 0,
        averageScore: 0,
        topPerformer: null,
      };
    }

    const successCount = submissions.filter((s) => s.status === 'success').length;
    const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
    const avgScore = Math.round(totalScore / submissions.length);

    const userScores = {};
    submissions.forEach((submission) => {
      const userId = submission.userId?._id || 'unknown';
      const userName = submission.userId?.name || 'Unknown User';
      if (!userScores[userId]) {
        userScores[userId] = { name: userName, submissions: 0, totalScore: 0 };
      }
      userScores[userId].submissions += 1;
      userScores[userId].totalScore += submission.score || 0;
    });

    const topPerformer = Object.entries(userScores).reduce((max, [, current]) => {
      const currentAvg = current.totalScore / current.submissions;
      const maxAvg = max.totalScore / max.submissions;
      return currentAvg > maxAvg ? current : max;
    });

    return {
      totalSubmissions: submissions.length,
      successRate: Math.round((successCount / submissions.length) * 100),
      averageScore: avgScore,
      topPerformer,
    };
  }, [submissions]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Submission Analytics</h2>
          <p className="mt-2 text-sm text-slate-600">View all coding submissions and user performance data.</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to Admin Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Total Submissions</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalSubmissions}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Success Rate</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{stats.successRate}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Average Score</p>
          <p className="mt-2 text-3xl font-bold text-indigo-700">{stats.averageScore}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Top Performer</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{stats.topPerformer?.name || 'N/A'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-700">
            Filter by Status
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-500"
            >
              <option value="all">All Submissions</option>
              <option value="success">Success Only</option>
              <option value="failed">Failed Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700 lg:col-span-2">
            Search User
            <input
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Name or email..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </label>
        </div>
      </div>

      {/* Submissions List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-rose-700">{error}</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">No submissions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Challenge</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Language</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <div className="font-medium text-slate-900">{submission.userId?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{submission.userId?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{submission.challengeId?.title || 'Challenge'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{submission.language}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{submission.score || 0}%</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          submission.status === 'success'
                            ? 'bg-emerald-100 text-emerald-700'
                            : submission.status === 'failed'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{new Date(submission.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
