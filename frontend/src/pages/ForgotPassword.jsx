import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/AuthLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import PasswordInput from '../components/PasswordInput';
import { clearError, clearMessage, forgotPassword, loginWithTempPassword } from '../features/auth/authSlice';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter temp password
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [dispatch]);

  const handleRequestTempPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    const result = await dispatch(forgotPassword(email));
    
    if (!result.payload?.status) {
      // Success - move to step 2
      setStep(2);
      setTempPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    const result = await dispatch(
      loginWithTempPassword({
        email,
        tempPassword,
        newPassword,
      })
    );

    if (result.type === 'auth/loginWithTempPassword/fulfilled') {
      // Success - navigate to dashboard
      navigate('/dashboard', { replace: true });
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    dispatch(clearMessage());
    dispatch(clearError());
    setTempPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Forgot password' : 'Set new password'}
      subtitle={
        step === 1
          ? 'Enter your email and we\'ll send you a temporary password'
          : 'Enter the temporary password and set your new password'
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {passwordError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {passwordError}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestTempPassword} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Send temporary password'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSetNewPassword} className="space-y-5">
          <PasswordInput
            id="tempPassword"
            name="tempPassword"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            label="Temporary password"
            required
            autoComplete="off"
            placeholder="Enter the password from your email"
          />

          <PasswordInput
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            label="New password"
            required
            autoComplete="new-password"
            placeholder="Enter your new password"
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Confirm password"
            required
            autoComplete="new-password"
            placeholder="Confirm your new password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Set new password'}
          </button>

          <button
            type="button"
            onClick={handleBackToStep1}
            disabled={isLoading}
            className="w-full rounded-lg border-2 border-indigo-600 px-4 py-2.5 font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
