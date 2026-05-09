import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Telegram init data to requests
api.interceptors.request.use((config) => {
  const tg = window.Telegram?.WebApp;
  if (tg?.initData) {
    config.headers['X-Telegram-Init-Data'] = tg.initData;
  }
  
  // For development without Telegram
  if (import.meta.env.DEV && !tg?.initData) {
    config.headers['X-Telegram-Id'] = '123456789';
    config.headers['X-Telegram-Firstname'] = 'Dev';
    config.headers['X-Telegram-Username'] = 'devuser';
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User API
export const userApi = {
  auth: (referralCode) => api.post('/user/auth', { referralCode }),
  getProfile: () => api.get('/user/profile'),
  getPointsHistory: () => api.get('/user/points-history')
};

// Tasks API
export const tasksApi = {
  getAll: () => api.get('/tasks'),
  complete: (taskId) => api.post(`/tasks/${taskId}/complete`)
};

// Daily Reward API
export const dailyApi = {
  getStatus: () => api.get('/daily/status'),
  claim: () => api.post('/daily/claim')
};

// Referral API
export const referralApi = {
  getInfo: () => api.get('/referral/info'),
  getLink: () => api.get('/referral/link')
};

// Leaderboard API
export const leaderboardApi = {
  get: (type = 'points', limit = 100) => 
    api.get('/leaderboard', { params: { type, limit } })
};

export default api;
