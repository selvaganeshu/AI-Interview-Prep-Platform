import api from './api';

const interviewApi = {
  createInterview: (payload) => api.post('/interview', payload),
  generateQuestions: (interviewId, payload) => api.post(`/interview/${interviewId}/generate-questions`, payload),
  getInterview: (interviewId) => api.get(`/interview/${interviewId}`),
  startInterview: (interviewId) => api.post(`/interview/${interviewId}/start`),
  submitAnswer: (interviewId, questionId, payload) => api.post(`/interview/${interviewId}/question/${questionId}/submit`, payload),
  completeInterview: (interviewId) => api.post(`/interview/${interviewId}/complete`),
  getUserInterviews: () => api.get('/interview'),
  getInterviewStats: () => api.get('/interview/stats'),
  getInterviewResults: (interviewId) => api.get(`/interview/${interviewId}/results`),
};

export default interviewApi;
