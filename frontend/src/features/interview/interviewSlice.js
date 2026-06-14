import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import interviewApi from '../../services/interviewApi';

const initialState = {
  interviews: [],
  current: null,
  questions: [],
  loading: false,
  error: null,
  stats: null,
};

export const createInterview = createAsyncThunk(
  'interview/createInterview',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await interviewApi.createInterview(payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const generateQuestions = createAsyncThunk(
  'interview/generateQuestions',
  async ({ interviewId, questionCount }, { rejectWithValue }) => {
    try {
      const res = await interviewApi.generateQuestions(interviewId, { questionCount });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getInterview = createAsyncThunk(
  'interview/getInterview',
  async (interviewId, { rejectWithValue }) => {
    try {
      const res = await interviewApi.getInterview(interviewId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const submitAnswer = createAsyncThunk(
  'interview/submitAnswer',
  async ({ interviewId, questionId, userAnswer, timeTaken }, { rejectWithValue }) => {
    try {
      const res = await interviewApi.submitAnswer(interviewId, questionId, { userAnswer, timeTaken });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const completeInterview = createAsyncThunk(
  'interview/completeInterview',
  async (interviewId, { rejectWithValue }) => {
    try {
      const res = await interviewApi.completeInterview(interviewId);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getUserInterviews = createAsyncThunk(
  'interview/getUserInterviews',
  async (_, { rejectWithValue }) => {
    try {
      const res = await interviewApi.getUserInterviews();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getInterviewStats = createAsyncThunk(
  'interview/getInterviewStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await interviewApi.getInterviewStats();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
      state.questions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews.unshift(action.payload);
        state.current = action.payload;
      })
      .addCase(createInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(generateQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.interview;
        state.questions = action.payload.questions;
      })
      .addCase(generateQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getInterview.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.questions = action.payload.questions || [];
      })
      .addCase(getInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(submitAnswer.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.loading = false;
        // update current interview with response and score
        if (action.payload && action.payload.response) {
          state.current.score = action.payload.currentScore;
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(completeInterview.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.interview || state.current;
      })
      .addCase(completeInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserInterviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = action.payload;
      })
      .addCase(getUserInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getInterviewStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInterviewStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getInterviewStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrent } = interviewSlice.actions;
export default interviewSlice.reducer;
