import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import ProgressChart from '../components/ProgressChart';
import TopicRadarChart from '../components/TopicRadarChart';
import api from '../services/api';

const defaultStats = [
  { title: 'Mock Interviews', value: '12', footnote: '+3 this week' },
  { title: 'Questions Practiced', value: '148', footnote: '+24 this week' },
  { title: 'Average Score', value: '78%', footnote: '+5% improvement' },
  { title: 'Study Streak', value: '7 days', footnote: 'Keep it up!' },
];

const defaultProgress = [
  { week: 'Mon', progress: 68, practice: 20 },
  { week: 'Tue', progress: 72, practice: 30 },
  { week: 'Wed', progress: 80, practice: 42 },
  { week: 'Thu', progress: 76, practice: 35 },
  { week: 'Fri', progress: 82, practice: 50 },
  { week: 'Sat', progress: 88, practice: 65 },
  { week: 'Sun', progress: 93, practice: 72 },
];

const fallbackWeakTopics = [
  { topic: 'Algorithms', level: 58 },
  { topic: 'System Design', level: 68 },
  { topic: 'Behavioral', level: 76 },
  { topic: 'Data Structures', level: 64 },
  { topic: 'Communication', level: 82 },
];

const recentHistoryDefault = [
  'Completed JavaScript technical mock interview',
  'Reviewed system design: URL shortener',
  'Practiced behavioral questions with STAR stories',
];

const recommendations = [
  'Practice 5 coding challenges this week',
  'Schedule a mock interview for next Tuesday',
  'Review your last feedback from system design',
  'Complete the behavioral interview checklist',
];

const Dashboard = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setDashboardData(data.data);
      } catch (err) {
        setApiError(err.message || 'Failed to load dashboard');
      }
    };

    loadDashboard();
  }, []);

  if (isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = dashboardData
    ? [
        { title: 'Mock Interviews', value: dashboardData.mockInterviews, footnote: '+3 this week' },
        { title: 'Questions Practiced', value: dashboardData.questionsPracticed, footnote: '+24 this week' },
        { title: 'Average Score', value: dashboardData.averageScore, footnote: '+5% improvement' },
        { title: 'Study Streak', value: dashboardData.studyStreak, footnote: 'Keep it up!' },
      ]
    : defaultStats;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <DashboardShell
        title="Interview Readiness"
        subtitle="Track your progress, reinforce weak topics, and keep interviews within reach."
      >
        {apiError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/80 dark:text-red-300">
            {apiError}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid gap-6">
            <div id="overview" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
              {stats.map((stat) => (
                <StatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  footnote={stat.footnote}
                />
              ))}
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Interview Progress</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Progress across practice sessions and score improvement trends.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-200">
                  Strong streak
                </span>
              </div>

              <div className="mt-6">
                <ProgressChart data={dashboardData?.progressTrend ?? defaultProgress} />
              </div>
            </section>

            <section id="analytics" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weak Topic Analysis</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    See the topics where you can gain the most momentum.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Top priorities
                </div>
              </div>
              <div className="mt-6">
                <TopicRadarChart data={dashboardData?.weakTopics ?? fallbackWeakTopics} />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section id="profile" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Your Profile</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{user?.name}</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-200">
                  {user?.role || 'student'} view
                </span>
              </div>

              <dl className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <dt>Email</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <dt>Next Session</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">Tomorrow · 11:00 AM</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Completion Target</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">90%</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Interview History</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {(dashboardData?.recentHistory ?? recentHistoryDefault).map((item) => (
                  <li key={item} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/80">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-indigo-600">Recommendations</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Personalized Actions</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Role based
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {recommendations.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/80">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
};

export default Dashboard;
