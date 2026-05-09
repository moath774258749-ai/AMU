import { create } from 'zustand';
import { userApi, tasksApi, dailyApi, referralApi, leaderboardApi } from '../services/api';

const useStore = create((set, get) => ({
  // User State
  user: null,
  isLoading: true,
  error: null,
  
  // Language
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  
  // Tasks
  tasks: [],
  tasksLoading: false,
  
  // Daily
  dailyStatus: null,
  dailyLoading: false,
  
  // Referral
  referralInfo: null,
  referralLink: null,
  
  // Leaderboard
  leaderboard: [],
  leaderboardLoading: false,
  
  // Auth and User
  initUser: async (referralCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.auth(referralCode);
      set({ user: response.data.user, isLoading: false });
      return response.data.user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  refreshUser: async () => {
    try {
      const response = await userApi.getProfile();
      set({ user: response.data.user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },
  
  // Tasks
  fetchTasks: async () => {
    set({ tasksLoading: true });
    try {
      const response = await tasksApi.getAll();
      set({ tasks: response.data.tasks, tasksLoading: false });
    } catch (error) {
      set({ tasksLoading: false });
      console.error('Failed to fetch tasks:', error);
    }
  },
  
  completeTask: async (taskId) => {
    try {
      const response = await tasksApi.complete(taskId);
      if (response.data.success) {
        // Update task status
        set(state => ({
          tasks: state.tasks.map(t => 
            t._id === taskId ? { ...t, completed: true } : t
          ),
          user: state.user ? {
            ...state.user,
            points: response.data.newBalance
          } : null
        }));
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Daily Rewards
  fetchDailyStatus: async () => {
    set({ dailyLoading: true });
    try {
      const response = await dailyApi.getStatus();
      set({ dailyStatus: response.data, dailyLoading: false });
    } catch (error) {
      set({ dailyLoading: false });
      console.error('Failed to fetch daily status:', error);
    }
  },
  
  claimDailyReward: async () => {
    try {
      const response = await dailyApi.claim();
      if (response.data.success) {
        set(state => ({
          user: state.user ? {
            ...state.user,
            points: response.data.newBalance,
            dailyStreak: response.data.newStreak
          } : null
        }));
        await get().fetchDailyStatus();
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Referral
  fetchReferralInfo: async () => {
    try {
      const [infoRes, linkRes] = await Promise.all([
        referralApi.getInfo(),
        referralApi.getLink()
      ]);
      set({ 
        referralInfo: infoRes.data,
        referralLink: linkRes.data
      });
    } catch (error) {
      console.error('Failed to fetch referral info:', error);
    }
  },
  
  // Leaderboard
  fetchLeaderboard: async (type = 'points') => {
    set({ leaderboardLoading: true });
    try {
      const response = await leaderboardApi.get(type);
      set({ leaderboard: response.data, leaderboardLoading: false });
    } catch (error) {
      set({ leaderboardLoading: false });
      console.error('Failed to fetch leaderboard:', error);
    }
  }
}));

export default useStore;
