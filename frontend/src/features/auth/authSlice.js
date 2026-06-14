import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const token = localStorage.getItem('token') || sessionStorage.getItem('token');
const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: token || null,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
  message: null,
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

const resetAuthState = (state) => {
  state.isLoading = false;
  state.isAuthenticated = false;
  state.user = null;
  state.token = null;
  state.message = null;
  clearAuth();
};

const persistAuth = (tokenValue, user, rememberMe = true) => {
  clearAuth();
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('token', tokenValue);
  storage.setItem('user', JSON.stringify(user));
};

const getErrorPayload = (error) => ({
  message: error?.message || 'Something went wrong',
  status: error?.status,
});

const getErrorMessage = (payload) =>
  payload?.message || payload || 'Something went wrong';

const isUnauthorizedError = (payload) =>
  payload?.status === 401 ||
  payload?.message?.includes('Not authorized') ||
  payload === 'Not authorized, token invalid or expired' ||
  payload === 'Not authorized, no token provided';

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.user;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data.message;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

export const loginWithTempPassword = createAsyncThunk(
  'auth/loginWithTempPassword',
  async ({ email, tempPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login-temp-password', {
        email,
        tempPassword,
        newPassword,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
      clearAuth();
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
      state.error = null;
    };

    const handleAuthFulfilled = (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.message = action.payload.message || null;
      const rememberMe = action.meta.arg?.rememberMe ?? true;
      persistAuth(action.payload.token, action.payload.user, rememberMe);
    };

    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.error = getErrorMessage(action.payload || action.error);
    };

    builder
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleAuthFulfilled)
      .addCase(register.rejected, handleRejected)

      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleAuthFulfilled)
      .addCase(login.rejected, handleRejected)

      .addCase(getMe.pending, handlePending)
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(getMe.rejected, (state, action) => {
        state.error = getErrorMessage(action.payload || action.error);
        resetAuthState(state);
      })

      .addCase(resetPassword.pending, handlePending)
      .addCase(resetPassword.fulfilled, handleAuthFulfilled)
      .addCase(resetPassword.rejected, handleRejected)

      .addCase(loginWithTempPassword.pending, handlePending)
      .addCase(loginWithTempPassword.fulfilled, handleAuthFulfilled)
      .addCase(loginWithTempPassword.rejected, handleRejected)

      .addCase(forgotPassword.pending, handlePending)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, handleRejected);
  },
});

export const { logout, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
