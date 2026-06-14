import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCodingAnalytics } from '../features/coding/codingSlice';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function CodingAnalyticsPage() {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.coding);

  useEffect(() => {
    dispatch(getCodingAnalytics());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = analytics || {
    totalChallenges: 0,
    solvedChallenges: 0,
    successRate: 0,
    averageScore: 0,
    languageUsage: [],
  };

  const languageData = stats.languageUsage || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-slate-900">Coding Analytics</h1>
        <p className="mt-2 text-slate-600">Track your performance and progress across coding challenges.</p>

        {/* Key Metrics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Total Challenges</p>
            <p className="mt-3 text-4xl font-bold text-indigo-600">{stats.totalChallenges}</p>
            <p className="mt-2 text-xs text-slate-500">Available on platform</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Challenges Solved</p>
            <p className="mt-3 text-4xl font-bold text-emerald-600">{stats.solvedChallenges}</p>
            <p className="mt-2 text-xs text-slate-500">
              {stats.totalChallenges > 0
                ? `${Math.round((stats.solvedChallenges / stats.totalChallenges) * 100)}% of total`
                : 'N/A'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Success Rate</p>
            <p className="mt-3 text-4xl font-bold text-blue-600">{stats.successRate}%</p>
            <p className="mt-2 text-xs text-slate-500">Submissions with success status</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Average Score</p>
            <p className="mt-3 text-4xl font-bold text-purple-600">{stats.averageScore}%</p>
            <p className="mt-2 text-xs text-slate-500">Across all submissions</p>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Language Usage */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Language Usage</h2>
            <p className="mt-1 text-sm text-slate-600">Distribution of submissions by language</p>
            {languageData.length > 0 ? (
              <div className="mt-6 flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ language, count }) => `${language}: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {languageData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} submissions`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-slate-600">
                No submissions yet
              </div>
            )}
          </div>

          {/* Progress Summary */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Progress Summary</h2>
            <p className="mt-1 text-sm text-slate-600">Your performance metrics</p>

            <div className="mt-6 space-y-4">
              {/* Solved Progress */}
              <div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-900">Challenges Solved</span>
                  <span className="text-slate-700">
                    {stats.solvedChallenges}/{stats.totalChallenges}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width:
                        stats.totalChallenges > 0
                          ? `${(stats.solvedChallenges / stats.totalChallenges) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>

              {/* Success Rate Progress */}
              <div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-900">Success Rate</span>
                  <span className="text-slate-700">{stats.successRate}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${stats.successRate}%` }}
                  />
                </div>
              </div>

              {/* Average Score Progress */}
              <div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-900">Average Score</span>
                  <span className="text-slate-700">{stats.averageScore}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${stats.averageScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Quick Stats</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
              <p className="text-sm text-indigo-900">Total Submissions</p>
              <p className="mt-2 text-3xl font-bold text-indigo-700">
                {stats.languageUsage?.reduce((sum, l) => sum + l.count, 0) || 0}
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
              <p className="text-sm text-emerald-900">Success Submissions</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {Math.round(
                  ((stats.successRate || 0) / 100) *
                    (stats.languageUsage?.reduce((sum, l) => sum + l.count, 0) || 0)
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4">
              <p className="text-sm text-purple-900">Languages Used</p>
              <p className="mt-2 text-3xl font-bold text-purple-700">{languageData.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
