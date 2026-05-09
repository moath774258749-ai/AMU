import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Coins, 
  Gift, 
  CheckSquare, 
  Users, 
  Trophy, 
  TrendingUp,
  Zap,
  Star
} from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { leaderboardApi, dailyApi } from '../services/api';
import Loading from '../components/Loading';
import './Dashboard.css';

export default function Dashboard() {
  const { user, dbUser, loading, refreshUser } = useTelegram();
  const [rank, setRank] = useState(null);
  const [dailyStatus, setDailyStatus] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const [rankRes, dailyRes] = await Promise.all([
        leaderboardApi.getRank(user.id),
        dailyApi.getStatus(user.id)
      ]);
      setRank(rankRes.data);
      setDailyStatus(dailyRes.data);
    } catch (err) {
      console.error('Dashboard data error:', err);
    }
  };

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  const quickActions = [
    { 
      to: '/daily', 
      icon: Gift, 
      label: 'Daily Reward', 
      color: 'var(--success)',
      badge: dailyStatus?.canClaim ? 'Claim!' : null
    },
    { 
      to: '/tasks', 
      icon: CheckSquare, 
      label: 'Complete Tasks', 
      color: 'var(--primary)' 
    },
    { 
      to: '/referral', 
      icon: Users, 
      label: 'Invite Friends', 
      color: 'var(--secondary)' 
    },
    { 
      to: '/leaderboard', 
      icon: Trophy, 
      label: 'Leaderboard', 
      color: 'var(--warning)' 
    },
  ];

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <motion.div 
        className="welcome-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="welcome-avatar">
          {user?.photo_url ? (
            <img src={user.photo_url} alt={user.first_name} />
          ) : (
            <span>{user?.first_name?.[0] || 'U'}</span>
          )}
        </div>
        <h1 className="welcome-title">
          Welcome back, <span className="text-gradient">{user?.first_name || 'User'}</span>
        </h1>
        <p className="welcome-subtitle">Ready to earn some points today?</p>
      </motion.div>

      {/* Points Card */}
      <motion.div 
        className="points-card card-glow"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="points-header">
          <Coins size={24} className="points-icon" />
          <span>Your Balance</span>
        </div>
        <div className="points-amount">
          {dbUser?.points?.toLocaleString() || '0'}
          <span className="points-label">POINTS</span>
        </div>
        <div className="points-footer">
          <div className="stat-item">
            <Trophy size={16} />
            <span>Rank #{rank?.rank || '-'}</span>
          </div>
          <div className="stat-item">
            <TrendingUp size={16} />
            <span>{rank?.total_users || 0} Users</span>
          </div>
        </div>
      </motion.div>

      {/* Daily Streak */}
      {dailyStatus && (
        <motion.div 
          className="streak-card card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="streak-info">
            <Zap size={24} className="streak-icon" />
            <div>
              <h3>Daily Streak</h3>
              <p>{dailyStatus.currentStreak} day{dailyStatus.currentStreak !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {dailyStatus.canClaim && (
            <Link to="/daily" className="btn btn-success">
              <Star size={16} />
              Claim +{dailyStatus.nextReward}
            </Link>
          )}
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div 
        className="quick-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <Link 
              key={action.to} 
              to={action.to} 
              className="action-card card"
              style={{ '--action-color': action.color }}
            >
              <div className="action-icon">
                <action.icon size={24} />
              </div>
              <span className="action-label">{action.label}</span>
              {action.badge && (
                <span className="action-badge">{action.badge}</span>
              )}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="stats-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="section-title">Your Stats</h2>
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-value">{dbUser?.referral_count || 0}</div>
            <div className="stat-name">Referrals</div>
          </div>
          <div className="stat-card card">
            <div className="stat-value">{dailyStatus?.currentStreak || 0}</div>
            <div className="stat-name">Day Streak</div>
          </div>
          <div className="stat-card card">
            <div className="stat-value">#{rank?.rank || '-'}</div>
            <div className="stat-name">Global Rank</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
