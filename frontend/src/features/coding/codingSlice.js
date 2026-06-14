import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import codingApi from '../../services/codingApi';

const initialState = {
  challenges: [],
  selectedChallenge: null,
  submissions: [],
  result: null,
  runResult: null,
  analytics: null,
  loading: false,
  runLoading: false,
  error: null,
};

export const getChallenges = createAsyncThunk(
  'coding/getChallenges',
  async (_, { rejectWithValue }) => {
    try {
      const res = await codingApi.getChallenges();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load challenges');
    }
  }
);

export const getSubmissions = createAsyncThunk(
  'coding/getSubmissions',
  async (_, { rejectWithValue }) => {
    try {
      const res = await codingApi.getHistory();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load submissions');
    }
  }
);

export const runCode = createAsyncThunk(
  'coding/runCode',
  async ({ sourceCode, language, stdin, challengeId, timeLimit }, { rejectWithValue }) => {
    try {
      const res = await codingApi.runCode({ sourceCode, language, stdin, challengeId, timeLimit });
      return res.data.data;
    } catch (err) {
      // err is already processed by API interceptor: { message, status }
      return rejectWithValue(err.message || 'Code execution failed');
    }
  }
);

export const submitSolution = createAsyncThunk(
  'coding/submitSolution',
  async ({ challengeId, sourceCode, language, timeTaken }, { rejectWithValue }) => {
    try {
      const res = await codingApi.submitSolution(challengeId, { sourceCode, language, timeTaken });
      return res.data.data;
    } catch (err) {
      // err is already processed by API interceptor: { message, status }
      return rejectWithValue(err.message || 'Submission failed');
    }
  }
);

export const getSubmission = createAsyncThunk(
  'coding/getSubmission',
  async (submissionId, { rejectWithValue }) => {
    try {
      const res = await codingApi.getSubmission(submissionId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load submission');
    }
  }
);

export const getCodingAnalytics = createAsyncThunk(
  'coding/getCodingAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await codingApi.getAnalytics();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load analytics');
    }
  }
);

const codingSlice = createSlice({
  name: 'coding',
  initialState,
  reducers: {
    setSelectedChallenge(state, action) {
      state.selectedChallenge = action.payload;
      state.result = null;
      state.error = null;
      state.runResult = null;
    },
    clearResult(state) {
      state.result = null;
      state.error = null;
      state.runResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChallenges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = action.payload;
        if (!state.selectedChallenge && action.payload.length > 0) {
          state.selectedChallenge = action.payload[0];
        }
      })
      .addCase(getChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(getSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(runCode.pending, (state) => {
        state.runLoading = true;
        state.error = null;
      })
      .addCase(runCode.fulfilled, (state, action) => {
        state.runLoading = false;
        state.runResult = action.payload;
      })
      .addCase(runCode.rejected, (state, action) => {
        state.runLoading = false;
        state.error = action.payload;
      })

      .addCase(submitSolution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitSolution.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
        if (action.payload?.submission) {
          state.submissions.unshift(action.payload.submission);
        }
      })
      .addCase(submitSolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(getSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getCodingAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCodingAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getCodingAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedChallenge, clearResult } = codingSlice.actions;
export default codingSlice.reducer;
