import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardShell from '../components/DashboardShell';
import StatCard from '../components/StatCard';
import ProgressChart from '../components/ProgressChart';
import TopicRadarChart from '../components/TopicRadarChart';
import api from '../services/api';
import { getMe } from '../features/auth/authSlice';

const defaultStats = [
  {
    title: 'Total Users',
    value: '1,248',
    footnote: 'Growth +12%',
    icon: '👥',
    trend: { label: '+12%', up: true, value: '74%' },
  },
  {
    title: 'Active Sessions',
    value: '86',
    footnote: 'Live now',
    icon: '⚡',
    trend: { label: '+8%', up: true, value: '62%' },
  },
  {
    title: 'Mock Interviews',
    value: '3,420',
    footnote: 'Weekly volume',
    icon: '🎯',
    trend: { label: '+4%', up: true, value: '53%' },
  },
  {
    title: 'Platform Score',
    value: '74%',
    footnote: 'Net promoter',
    icon: '⭐',
    trend: { label: '+6%', up: true, value: '68%' },
  },
];

const adminProgressTrend = [
  { week: 'Mon', progress: 42, practice: 18 },
  { week: 'Tue', progress: 55, practice: 24 },
  { week: 'Wed', progress: 62, practice: 32 },
  { week: 'Thu', progress: 70, practice: 41 },
  { week: 'Fri', progress: 75, practice: 49 },
  { week: 'Sat', progress: 80, practice: 58 },
  { week: 'Sun', progress: 84, practice: 64 },
];

const adminWeakTopics = [
  { topic: 'Interview Prep', level: 48 },
  { topic: 'User Growth', level: 62 },
  { topic: 'Platform Quality', level: 56 },
  { topic: 'Retention', level: 68 },
  { topic: 'Engagement', level: 72 },
];

const adminActions = [
  'Review new mentor applications',
  'Approve content updates for behavioral questions',
  'Verify platform usage spikes from last week',
  'Export performance reports for stakeholders',
];

const adminOperations = [
  {
    title: 'Manage Challenges',
    description: 'Edit coding content and assessments.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16M4 12h10M4 17h16" />
      </svg>
    ),
    to: '/admin/coding',
  },
  {
    title: 'View Submissions',
    description: 'Review coding submissions and candidate status.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6M9 16h6M7 20h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
      </svg>
    ),
    to: '/admin/submissions',
  },
  {
    title: 'Manage Users',
    description: 'Approve roles and platform access.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    to: null,
  },
  {
    title: 'View Reports',
    description: 'Export performance and usage insights.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 10h12M4 14h10M4 18h8" />
        <path d="M17 8v8" />
      </svg>
    ),
    to: null,
  },
];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [apiError, setApiError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!user) {
      dispatch(getMe());
      return;
    }

    const loadAdminStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.data.stats);
      } catch (err) {
        setApiError(err.message || 'Unable to load admin stats');
      }
    };

    loadAdminStats();
  }, [dispatch, user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const mainStats = stats
    ? [
        {
          title: 'Total Users',
          value: stats.totalUsers,
          footnote: 'Growth +12%',
          icon: '👥',
          trend: { label: '+12%', up: true, value: '74%' },
        },
        {
          title: 'Active Sessions',
          value: stats.activeSessions,
          footnote: 'Live now',
          icon: '⚡',
          trend: { label: '+8%', up: true, value: '62%' },
        },
        {
          title: 'Mock Interviews',
          value: stats.mockInterviews,
          footnote: 'Weekly volume',
          icon: '🎯',
          trend: { label: '+4%', up: true, value: '53%' },
        },
        {
          title: 'Platform Score',
          value: `${stats.averageScore}%`,
          footnote: 'Net promoter',
          icon: '⭐',
          trend: { label: '+6%', up: true, value: '68%' },
        },
      ]
    : defaultStats;

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC]">
      <Navbar />

      <DashboardShell
        admin
        title="Platform Insights"
        subtitle="Monitor growth, users, and interview readiness across the product."
      >
        {apiError && (
          <div className="rounded-[1.5rem] border border-[#EF4444] bg-[#31171f] p-4 text-sm text-[#fecaca]">
            {apiError}
          </div>
        )}

        <section id="overview" className="rounded-[1.5rem] border border-[#334155] bg-[#111827] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6366F1]">Platform Insights</p>
              <h1 className="text-4xl font-semibold text-white">Administrator Dashboard</h1>
              <p className="text-sm leading-7 text-[#94A3B8]">
                A premium command center for the platform team. Monitor performance, manage content, and review usage in one polished view.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#0F172A] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                  Live
                </span>
                <span className="inline-flex rounded-full border border-[#334155] bg-[#0F172A] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
                  {user?.role ? user.role.toUpperCase() : 'ADMIN'}
                </span>
                <span className="inline-flex rounded-full border border-[#334155] bg-[#0F172A] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
                  {currentTime.toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:w-[420px]">
              <div className="rounded-[1.5rem] border border-[#334155] bg-[#0F172A] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">Administrator</p>
                <p className="mt-3 text-xl font-semibold text-white">{user?.name || 'Admin User'}</p>
                <p className="mt-2 text-sm text-[#94A3B8]">Responsible for platform growth, content quality, and team operations.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#334155] bg-[#0F172A] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">Live Status</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="inline-flex h-3.5 w-3.5 rounded-full bg-[#10B981]" />
                  <div>
                    <p className="font-semibold text-white">Platform Healthy</p>
                    <p className="text-sm text-[#94A3B8]">No alerts in the last hour.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="reports" className="rounded-[1.5rem] border border-[#334155] bg-[#111827] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Admin Operations</h2>
              <p className="mt-2 text-sm text-[#94A3B8]">Quick access to challenge, submission, and platform workflows.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {adminOperations.map((action) => {
              const cardContent = (
                <div className="flex h-full flex-col justify-between gap-4 rounded-[1.5rem] border border-[#334155] bg-[#0F172A] p-5 transition hover:-translate-y-0.5 hover:border-[#6366F1] hover:bg-[#1E293B]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#111827] text-[#6366F1]">
                    {action.icon}
                  </div>
                  <div className="space-y-2 text-left">
                    <h3 className="text-base font-semibold text-white">{action.title}</h3>
                    <p className="text-sm text-[#94A3B8]">{action.description}</p>
                  </div>
                  <div className="text-sm font-semibold text-[#6366F1]">Open</div>
                </div>
              );

              return action.to ? (
                <Link key={action.title} to={action.to} className="block">
                  {cardContent}
                </Link>
              ) : (
                <button key={action.title} type="button" className="block">
                  {cardContent}
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {mainStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              footnote={stat.footnote}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
          <section id="insights" className="rounded-[1.5rem] border border-[#334155] bg-[#111827] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Engagement Trend</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Weekly platform activity and interview readiness growth.
                </p>
              </div>
              <span className="rounded-full bg-[#0F172A] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
                Real time
              </span>
            </div>
            <div className="mt-6">
              <ProgressChart data={stats?.progressTrend ?? adminProgressTrend} />
            </div>
          </section>

          <section id="users" className="rounded-[1.5rem] border border-[#334155] bg-[#111827] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Operational Priority</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Topics and areas that need extra coaching or platform focus.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <TopicRadarChart data={stats?.weakTopics ?? adminWeakTopics} />
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.75fr_1fr]">
          <section className="rounded-[1.5rem] border border-[#334155] bg-[#111827] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-semibold text-white">Admin Actions</h2>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Quick operational tasks to support platform reliability.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[#94A3B8]">
              {adminActions.map((action) => (
                <li key={action} className="rounded-[1.5rem] border border-[#334155] bg-[#0F172A] p-4 text-[#F8FAFC] transition hover:border-[#6366F1] hover:bg-[#1E293B]">
                  {action}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.5rem] border border-[#334155] bg-[#111827] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-semibold text-white">User Health Summary</h2>
            <div className="mt-5 space-y-4 text-sm text-[#94A3B8]">
              <div className="rounded-[1.5rem] border border-[#334155] bg-[#0F172A] p-4">
                <p className="font-semibold text-white">Daily active users</p>
                <p className="mt-2 text-[#94A3B8]">2,148 learners active in the last 24 hours.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#334155] bg-[#0F172A] p-4">
                <p className="font-semibold text-white">Interview readiness</p>
                <p className="mt-2 text-[#94A3B8]">63% of learners are trending toward their next interview.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#334155] bg-[#0F172A] p-4">
                <p className="font-semibold text-white">Feedback velocity</p>
                <p className="mt-2 text-[#94A3B8]">Average response time to review requests is 4 hours.</p>
              </div>
            </div>
          </section>
        </div>
      </DashboardShell>
    </div>
  );
};

export default AdminDashboard;
