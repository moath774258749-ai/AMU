import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Coins, 
  Trophy, 
  Calendar, 
  Users,
  History,
  ChevronRight,
  Gift,
  CheckSquare,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { userApi, leaderboardApi } from '../services/api';
import Loading from '../components/Loading';
import './Profile.css';

const ACTION_ICONS = {
  daily: Gift,
  task: CheckSquare,
  referral: Users,
  referral_bonus: Gift,
};

export default function Profile() {
  const { user, dbUser } = useTelegram();
  const [rank, setRank] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const [rankRes, historyRes] = await Promise.all([
        leaderboardApi.getRank(user.id),
        userApi.getPointsHistory(user.id)
      ]);
      setRank(rankRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Profile data error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading profile..." />;
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <motion.div 
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-avatar">
          {user?.photo_url ? (
            <img src={user.photo_url} alt={user.first_name} />
          ) : (
            <span>{user?.first_name?.[0] || 'U'}</span>
          )}
        </div>
        <h1 className="profile-name">
          {user?.first_name} {user?.last_name || ''}
        </h1>
        <p className="profile-username">@{user?.username || 'user'}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="profile-stats"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat-card card">
          <Coins size={24} className="stat-icon points" />
          <div className="stat-value">{dbUser?.points?.toLocaleString() || 0}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="stat-card card">
          <Trophy size={24} className="stat-icon rank" />
          <div className="stat-value">#{rank?.rank || '-'}</div>
          <div className="stat-label">Global Rank</div>
        </div>
        <div className="stat-card card">
          <Users size={24} className="stat-icon referrals" />
          <div className="stat-value">{dbUser?.referral_count || 0}</div>
          <div className="stat-label">Referrals</div>
        </div>
        <div className="stat-card card">
          <Calendar size={24} className="stat-icon joined" />
          <div className="stat-value">
            {dbUser?.created_at 
              ? new Date(dbUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '-'
            }
          </div>
          <div className="stat-label">Joined</div>
        </div>
      </motion.div>

      {/* Points History */}
      <motion.div 
        className="history-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="section-header">
          <History size={20} />
          <h2>Points History</h2>
        </div>

        {history.length > 0 ? (
          <div className="history-list">
            {history.map((item, index) => {
              const IconComponent = ACTION_ICONS[item.action_type] || Coins;
              const isPositive = item.amount > 0;
              
              return (
                <motion.div
                  key={item.id}
                  className="history-item card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.03 }}
                >
                  <div className={`history-icon ${item.action_type}`}>
                    <IconComponent size={18} />
                  </div>
                  
                  <div className="history-info">
                    <span className="history-description">{item.description}</span>
                    <span className="history-time">{formatDate(item.created_at)}</span>
                  </div>
                  
                  <div className={`history-amount ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    <span>{isPositive ? '+' : ''}{item.amount}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="no-history">
            <History size={32} />
            <p>No points history yet</p>
            <span>Start earning points to see your activity here!</span>
          </div>
        )}
      </motion.div>

      {/* Account Info */}
      <motion.div 
        className="account-section card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3>Account Details</h3>
        <div className="account-items">
          <div className="account-item">
            <span className="account-label">Telegram ID</span>
            <span className="account-value">{user?.id}</span>
          </div>
          <div className="account-item">
            <span className="account-label">Referral Code</span>
            <span className="account-value">{dbUser?.referral_code || '-'}</span>
          </div>
          <div className="account-item">
            <span className="account-label">Member Since</span>
            <span className="account-value">
              {dbUser?.created_at 
                ? new Date(dbUser.created_at).toLocaleDateString()
                : '-'
              }
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
