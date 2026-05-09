import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Daily } from './pages/Daily';
import { Friends } from './pages/Friends';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import useStore from './store/useStore';
import './styles/global.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="url(#gradient)" strokeWidth="4"/>
            <path d="M24 12V24L32 28" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                <stop stopColor="#19E3FF"/>
                <stop offset="1" stopColor="#7C5CFF"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="loading-title">Ubash</h1>
        <p className="loading-subtitle">Loading your rewards...</p>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
      <style>{`
        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          background-image: 
            radial-gradient(ellipse at top, rgba(25, 227, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(124, 92, 255, 0.1) 0%, transparent 50%);
        }
        .loading-content {
          text-align: center;
          padding: 24px;
        }
        .loading-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          animation: pulse 2s ease-in-out infinite;
        }
        .loading-logo svg {
          width: 100%;
          height: 100%;
        }
        .loading-title {
          font-family: var(--font-display);
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #19E3FF 0%, #7C5CFF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px;
        }
        .loading-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 0 0 32px;
        }
        .loading-spinner {
          display: flex;
          justify-content: center;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--bg-card);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className="error-screen">
      <div className="error-content">
        <div className="error-icon">!</div>
        <h2 className="error-title">Connection Error</h2>
        <p className="error-message">{error || 'Failed to connect. Please try again.'}</p>
        <button className="error-button" onClick={onRetry}>
          Retry
        </button>
      </div>
      <style>{`
        .error-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: 24px;
        }
        .error-content {
          text-align: center;
          max-width: 300px;
        }
        .error-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 24px;
          background: rgba(255, 77, 106, 0.15);
          border: 2px solid #FF4D6A;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          color: #FF4D6A;
        }
        .error-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 8px;
        }
        .error-message {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 0 0 24px;
        }
        .error-button {
          padding: 12px 32px;
          background: var(--primary);
          color: var(--bg-primary);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .error-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

function App() {
  const { user, isLoading, error, initUser, setLanguage } = useStore();
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    initializeApp();
  }, []);
  
  const initializeApp = async () => {
    // Initialize Telegram WebApp
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.expand();
      tg.enableClosingConfirmation();
      
      // Set theme based on Telegram theme
      if (tg.colorScheme === 'light') {
        document.documentElement.style.setProperty('--bg-primary', '#f5f5f5');
        // Keep dark theme for now as requested
      }
      
      // Set language from Telegram user
      const userLang = tg.initDataUnsafe?.user?.language_code;
      if (userLang === 'ar') {
        setLanguage('ar');
      }
    }
    
    // Get referral code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref') || urlParams.get('startapp');
    
    try {
      await initUser(referralCode);
      setInitialized(true);
    } catch (err) {
      console.error('Failed to initialize:', err);
      setInitialized(true);
    }
  };
  
  const handleRetry = () => {
    setInitialized(false);
    initializeApp();
  };
  
  if (isLoading && !initialized) {
    return <LoadingScreen />;
  }
  
  if (error && !user) {
    return <ErrorScreen error={error} onRetry={handleRetry} />;
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="daily" element={<Daily />} />
          <Route path="friends" element={<Friends />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
