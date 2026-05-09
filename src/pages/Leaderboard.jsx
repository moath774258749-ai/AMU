import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Coins, TrendingUp } from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { leaderboardApi } from '../services/api';
import Loading from '../components/Loading';
import './Leaderboard.css';

export default function Leaderboard() {
  const { user } = useTelegram();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const [leaderboardRes, rankRes] = await Promise.all([
        leaderboardApi.getAll(100),
        user?.id ? leaderboardApi.getRank(user.id) : Promise.resolve({ data: null })
      ]);
      setLeaderboard(leaderboardRes.data);
      setUserRank(rankRes.data);
    } catch (err) {
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading leaderboard..." />;
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown size={20} className="rank-icon gold" />;
      case 2: return <Medal size={20} className="rank-icon silver" />;
      case 3: return <Medal size={20} className="rank-icon bronze" />;
      default: return <span className="rank-number">{rank}</span>;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return '';
    }
  };

  return (
    <div className="leaderboard-page">
      {/* Header */}
      <motion.div 
        className="leaderboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="leaderboard-icon">
          <Trophy size={32} />
        </div>
        <h1>Leaderboard</h1>
        <p>Top performers in the UBASH community</p>
      </motion.div>

      {/* User Rank Card */}
      {userRank && (
        <motion.div 
          className="user-rank-card card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="your-rank-label">Your Position</div>
          <div className="your-rank-info">
            <div className="your-rank">
              <TrendingUp size={20} />
              <span>#{userRank.rank}</span>
            </div>
            <div className="your-points">
              <Coins size={16} />
              <span>{userRank.points?.toLocaleString() || 0}</span>
            </div>
          </div>
          <div className="total-users">
            out of {userRank.total_users?.toLocaleString() || 0} users
          </div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <motion.div 
          className="podium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Second Place */}
          <div className="podium-item silver">
            <div className="podium-avatar">
              {leaderboard[1].first_name?.[0] || 'U'}
            </div>
            <div className="podium-medal">
              <Medal size={24} />
            </div>
            <div className="podium-name">{leaderboard[1].first_name || 'User'}</div>
            <div className="podium-points">
              <Coins size={12} />
              {leaderboard[1].points?.toLocaleString()}
            </div>
            <div className="podium-stand">2</div>
          </div>

          {/* First Place */}
          <div className="podium-item gold">
            <div className="podium-avatar">
              {leaderboard[0].first_name?.[0] || 'U'}
            </div>
            <div className="podium-medal">
              <Crown size={28} />
            </div>
            <div className="podium-name">{leaderboard[0].first_name || 'User'}</div>
            <div className="podium-points">
              <Coins size={12} />
              {leaderboard[0].points?.toLocaleString()}
            </div>
            <div className="podium-stand">1</div>
          </div>

          {/* Third Place */}
          <div className="podium-item bronze">
            <div className="podium-avatar">
              {leaderboard[2].first_name?.[0] || 'U'}
            </div>
            <div className="podium-medal">
              <Medal size={20} />
            </div>
            <div className="podium-name">{leaderboard[2].first_name || 'User'}</div>
            <div className="podium-points">
              <Coins size={12} />
              {leaderboard[2].points?.toLocaleString()}
            </div>
            <div className="podium-stand">3</div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <motion.div 
        className="leaderboard-list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {leaderboard.slice(3).map((entry, index) => {
          const rank = index + 4;
          const isCurrentUser = entry.telegram_id === user?.id;
          
          return (
            <motion.div
              key={entry.telegram_id}
              className={`leaderboard-item card ${isCurrentUser ? 'current-user' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.02 }}
            >
              <div className="item-rank">
                {getRankIcon(rank)}
              </div>
              
              <div className="item-avatar">
                {entry.first_name?.[0] || 'U'}
              </div>
              
              <div className="item-info">
                <span className="item-name">
                  {entry.first_name || entry.username || 'User'}
                  {isCurrentUser && <span className="you-badge">You</span>}
                </span>
                <span className="item-username">
                  @{entry.username || 'user'}
                </span>
              </div>
              
              <div className="item-points">
                <Coins size={14} />
                <span>{entry.points?.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {leaderboard.length === 0 && (
        <div className="no-data">
          <Trophy size={48} />
          <p>No data yet</p>
          <span>Be the first to earn points!</span>
        </div>
      )}
    </div>
  );
}
