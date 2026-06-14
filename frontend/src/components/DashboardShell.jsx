// React imports not required here
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const userLinks = [
  { name: 'Overview', href: '#overview', icon: '📈' },
  { name: 'Practice', href: '/coding', icon: '🧠' },
  { name: 'Analytics', href: '/coding/analytics', icon: '📊' },
  { name: 'Profile', href: '/profile', icon: '👤' },
];

const adminLinks = [
  { name: 'Overview', href: '#overview', icon: '🚀' },
  { name: 'Users', href: '#users', icon: '👥' },
  { name: 'Reports', href: '#reports', icon: '📑' },
  { name: 'Insights', href: '#insights', icon: '💡' },
];

const DashboardShell = ({ title, subtitle, children, admin = false }) => {
  const { user } = useSelector((state) => state.auth);
  

  const navItems = admin ? adminLinks : userLinks;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="hidden rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:block">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">Workspace</p>
              <h2 className="text-2xl font-semibold text-slate-900">AI Interview Prep</h2>
              <p className="text-sm leading-6 text-slate-500">
                {admin
                  ? 'Monitor platform performance and support the interview experience.'
                  : 'Follow your progress, strengthen weak topics, and stay interview-ready.'}
              </p>
            </div>
            <div className="space-y-2 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-3">
              {navItems.map((item) => {
                const commonClass =
                  'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100';

                // Hash links should stay as anchors to scroll on-page.
                if (item.href && item.href.startsWith('#')) {
                  return (
                    <a key={item.name} href={item.href} className={commonClass}>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-lg text-indigo-600">
                        {item.icon}
                      </span>
                      {item.name}
                    </a>
                  );
                }

                // Otherwise treat as a route and use react-router Link
                return (
                  <Link key={item.name} to={item.href || '#'} className={commonClass}>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-lg text-indigo-600">
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Signed in as</p>
                <p className="text-base font-semibold text-slate-900">{user?.name || 'Guest'}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  {user?.role || 'student'}
                </p>
              </div>
              {/* Theme toggle removed — app uses a single light theme by default */}
            </div>
          </div>
        </aside>

        <section className="space-y-8">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                  {admin ? 'Administrator Dashboard' : 'Interview Progress'}
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
                <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Live insights
              </div>
            </div>
          </div>

          {children}
        </section>
      </div>
    </div>
  );
};

export default DashboardShell;
