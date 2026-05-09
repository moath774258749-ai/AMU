import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Telegram init data to requests
api.interceptors.request.use((config) => {
  const tg = window.Telegram?.WebApp;
  if (tg?.initData) {
    config.headers['X-Telegram-Init-Data'] = tg.initData;
  }
  return config;
});

// User API
export const userApi = {
  auth: (userData) => api.post('/api/user/auth', userData),
  getProfile: (telegramId) => api.get(`/api/user/profile/${telegramId}`),
  getPointsHistory: (telegramId) => api.get(`/api/user/points-history/${telegramId}`),
};

// Tasks API
export const tasksApi = {
  getAll: (telegramId) => api.get(`/api/tasks/${telegramId}`),
  complete: (telegramId, taskId) => api.post('/api/tasks/complete', { telegram_id: telegramId, task_id: taskId }),
};

// Daily Rewards API
export const dailyApi = {
  getStatus: (telegramId) => api.get(`/api/daily/status/${telegramId}`),
  claim: (telegramId) => api.post('/api/daily/claim', { telegram_id: telegramId }),
};

// Referral API
export const referralApi = {
  getInfo: (telegramId) => api.get(`/api/referral/${telegramId}`),
};

// Leaderboard API
export const leaderboardApi = {
  getAll: (limit = 100) => api.get(`/api/leaderboard?limit=${limit}`),
  getRank: (telegramId) => api.get(`/api/leaderboard/rank/${telegramId}`),
};

export default api;
