import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProfilePerformance = createAsyncThunk(
  'profile/fetchPerformance',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/profile/performance');
      return data.data;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to load profile performance');
    }
  }
);

const initialState = {
  data: null,
  isLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfilePerformance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfilePerformance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfilePerformance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to load profile performance';
      });
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
