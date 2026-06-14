import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-interview-prep-backend-qkhf.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Something went wrong',
      status: error.response?.status,
    };

    // Log full error details for debugging in Vite development mode
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        message: payload.message,
        status: payload.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }

    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('Error clearing tokens or redirecting to login:', e);
      }
    }

    return Promise.reject(payload);
  }
);

export default api;
