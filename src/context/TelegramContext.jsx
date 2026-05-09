import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userApi } from '../services/api';

const TelegramContext = createContext(null);

export function TelegramProvider({ children }) {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    
    if (telegram) {
      telegram.ready();
      telegram.expand();
      
      // Set theme
      document.documentElement.style.setProperty(
        '--tg-theme-bg-color',
        telegram.backgroundColor || '#0B1120'
      );
      
      setTg(telegram);
      
      const initUser = telegram.initDataUnsafe?.user;
      if (initUser) {
        setUser(initUser);
        authenticateUser(initUser);
      } else {
        // Development fallback
        if (import.meta.env.DEV) {
          const devUser = {
            id: 123456789,
            first_name: 'Dev',
            last_name: 'User',
            username: 'devuser',
          };
          setUser(devUser);
          authenticateUser(devUser);
        } else {
          setLoading(false);
          setError('Unable to get Telegram user data');
        }
      }
    } else {
      // Development mode without Telegram
      if (import.meta.env.DEV) {
        const devUser = {
          id: 123456789,
          first_name: 'Dev',
          last_name: 'User',
          username: 'devuser',
        };
        setUser(devUser);
        authenticateUser(devUser);
      } else {
        setLoading(false);
        setError('Please open this app in Telegram');
      }
    }
  }, []);

  const authenticateUser = async (telegramUser) => {
    try {
      // Get referral code from start param
      const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
      
      const response = await userApi.auth({
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        photo_url: telegramUser.photo_url,
        referral_code: startParam,
      });
      
      setDbUser(response.data.user);
    } catch (err) {
      console.error('Auth error:', err);
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await userApi.getProfile(user.id);
      setDbUser(response.data);
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  }, [user?.id]);

  const hapticFeedback = useCallback((type = 'impact') => {
    if (tg?.HapticFeedback) {
      switch (type) {
        case 'impact':
          tg.HapticFeedback.impactOccurred('medium');
          break;
        case 'notification':
          tg.HapticFeedback.notificationOccurred('success');
          break;
        case 'selection':
          tg.HapticFeedback.selectionChanged();
          break;
      }
    }
  }, [tg]);

  const showAlert = useCallback((message) => {
    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  }, [tg]);

  const value = {
    tg,
    user,
    dbUser,
    loading,
    error,
    refreshUser,
    hapticFeedback,
    showAlert,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}
