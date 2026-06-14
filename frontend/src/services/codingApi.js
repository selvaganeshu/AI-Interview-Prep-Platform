import api from './api';

const codingApi = {
  getChallenges: () => api.get('/coding/challenges'),
  getChallenge: (challengeId) => api.get(`/coding/challenges/${challengeId}`),
  runCode: (payload) => api.post('/coding/run', payload),
  submitSolution: (challengeId, payload) => api.post(`/coding/challenges/${challengeId}/submit`, payload),
  getHistory: () => api.get('/coding/history'),
  getSubmissions: () => api.get('/coding/submissions'),
  getSubmission: (submissionId) => api.get(`/coding/submissions/${submissionId}`),
  getAnalytics: () => api.get('/coding/analytics'),
  createChallenge: (payload) => api.post('/coding/challenges', payload),
  updateChallenge: (challengeId, payload) => api.put(`/coding/challenges/${challengeId}`, payload),
  deleteChallenge: (challengeId) => api.delete(`/coding/challenges/${challengeId}`),
  getAllSubmissions: () => api.get('/coding/submissions/all'),
};

export default codingApi;
