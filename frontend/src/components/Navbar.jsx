import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-[#334155] bg-[#0F172A]/95 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-xl font-semibold tracking-tight text-white">
            AI Interview Prep
          </Link>
          <span className="hidden rounded-full border border-[#334155] bg-[#111827] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8] sm:inline-flex">
            Admin
          </span>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <div className="hidden items-center gap-2 rounded-3xl bg-[#111827] px-3 py-2 text-sm text-[#94A3B8] sm:flex">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            <span className="font-medium text-white">{user?.name || 'Guest'}</span>
          </div>

          <div className="hidden items-center gap-4 text-sm font-medium text-[#94A3B8] sm:flex">
            {user?.role === 'admin' && (
              <Link to="/admin" className="transition hover:text-white">
                Admin Panel
              </Link>
            )}
            <Link to="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <Link to="/profile" className="transition hover:text-white">
              Profile
            </Link>
            <Link to="/resume" className="transition hover:text-white">
              Resume
            </Link>
            <Link to="/coding" className="transition hover:text-white">
              Coding
            </Link>
            <Link to="/coding/analytics" className="transition hover:text-white">
              Analytics
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl border border-[#334155] bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#6366F1] hover:bg-[#1E293B]"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
