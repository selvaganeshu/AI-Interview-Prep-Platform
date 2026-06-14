import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { getMe } from './features/auth/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminCodingPage from './pages/AdminCoding';
import AdminSubmissionsPage from './pages/AdminSubmissions';
import Resume from './pages/Resume';
import InterviewPage from './pages/Interview';
import CodingPage from './pages/Coding';
import CodingHistoryPage from './pages/CodingHistory';
import SubmissionDetailsPage from './pages/SubmissionDetails';
import CodingAnalyticsPage from './pages/CodingAnalytics';
import Profile from './pages/Profile';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === 'admin' ? '/admin' : '/dashboard'}
        replace
      />
    );
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/coding" element={<CodingPage />} />
          <Route path="/coding/history" element={<CodingHistoryPage />} />
          <Route path="/coding/submissions/:submissionId" element={<SubmissionDetailsPage />} />
          <Route path="/coding/analytics" element={<CodingAnalyticsPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/coding" element={<AdminCodingPage />} />
          <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
