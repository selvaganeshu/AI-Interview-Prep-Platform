import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/AuthLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import PasswordInput from '../components/PasswordInput';
import { clearError, resetPassword } from '../features/auth/authSlice';

const ResetPassword = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    const result = await dispatch(
      resetPassword({ token, password: formData.password })
    );

    if (resetPassword.fulfilled.match(result)) {
      navigate('/dashboard', { replace: true });
    }
  };

  const displayError = validationError || error;

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your new password below"
    >
      {displayError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          label="New password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Min. 6 characters"
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          label="Confirm new password"
          required
          autoComplete="new-password"
          placeholder="Repeat password"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Reset password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
