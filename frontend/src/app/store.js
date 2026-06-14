import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import resumeReducer from '../features/resume/resumeSlice';
import interviewReducer from '../features/interview/interviewSlice';
import codingReducer from '../features/coding/codingSlice';
import profileReducer from '../features/profile/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    interview: interviewReducer,
    coding: codingReducer,
    profile: profileReducer,
  },
});

export default store;
