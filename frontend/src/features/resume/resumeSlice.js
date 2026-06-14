import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const uploadResume = createAsyncThunk('resume/uploadResume', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/resume/upload', formData);
    return response.data.resume;
  } catch (error) {
    const message = error?.message || error?.response?.data?.message || 'Upload failed';
    return rejectWithValue(message);
  }
});

export const getUserResumes = createAsyncThunk('resume/getUserResumes', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/resume');
    return response.data.resumes;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch resumes');
  }
});

export const getResumeById = createAsyncThunk('resume/getResumeById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/resume/${id}`);
    return response.data.resume;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch resume');
  }
});

export const getResumeAnalysis = createAsyncThunk('resume/getResumeAnalysis', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/resume/${id}/analysis`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch analysis');
  }
});

export const deleteResume = createAsyncThunk('resume/deleteResume', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/resume/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete resume');
  }
});

export const setDefaultResume = createAsyncThunk('resume/setDefaultResume', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/resume/${id}/set-default`);
    return response.data.resume;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to set default resume');
  }
});

export const reanalyzeResume = createAsyncThunk('resume/reanalyzeResume', async (id, { rejectWithValue }) => {
  try {
    const response = await api.post(`/resume/${id}/reanalyze`);
    return response.data.resume;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to re-analyze resume');
  }
});

export const getResumeStats = createAsyncThunk('resume/getResumeStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/resume/stats');
    return response.data.stats;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
  }
});

const initialState = {
  resumes: [],
  currentResume: null,
  currentAnalysis: null,
  stats: null,
  loading: false,
  uploading: false,
  uploadProgress: 0,
  error: null,
  success: false,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Upload Resume
    builder
      .addCase(uploadResume.pending, (state) => {
        state.uploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 100;
        state.success = true;
        state.resumes.unshift(action.payload);
        state.currentResume = action.payload;
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      });

    // Get User Resumes
    builder
      .addCase(getUserResumes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserResumes.fulfilled, (state, action) => {
        state.loading = false;
        state.resumes = action.payload;
      })
      .addCase(getUserResumes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Resume By ID
    builder
      .addCase(getResumeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResumeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResume = action.payload;
      })
      .addCase(getResumeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Resume Analysis
    builder
      .addCase(getResumeAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResumeAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(getResumeAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Resume
    builder
      .addCase(deleteResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.resumes = state.resumes.filter((r) => r._id !== action.payload);
        if (state.currentResume?._id === action.payload) {
          state.currentResume = null;
        }
      })
      .addCase(deleteResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Set Default Resume
    builder
      .addCase(setDefaultResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultResume.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.resumes = state.resumes.map((r) => ({
          ...r,
          isDefault: r._id === action.payload._id,
        }));
      })
      .addCase(setDefaultResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Re-analyze Resume
    builder
      .addCase(reanalyzeResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reanalyzeResume.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentResume = action.payload;
        state.resumes = state.resumes.map((r) =>
          r._id === action.payload._id ? action.payload : r
        );
      })
      .addCase(reanalyzeResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Resume Stats
    builder
      .addCase(getResumeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResumeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getResumeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetError, resetSuccess, setUploadProgress } = resumeSlice.actions;
export default resumeSlice.reducer;
