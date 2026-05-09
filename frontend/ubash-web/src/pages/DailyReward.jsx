import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check, Clock, Zap, Coins, Star } from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { dailyApi } from '../services/api';
import Loading from '../components/Loading';
import './DailyReward.css';

const DAILY_REWARDS = [10, 20, 30, 50, 75, 100, 150];

export default function DailyReward() {
  const { user, refreshUser, hapticFeedback, showAlert } = useTelegram();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [claimedReward, setClaimedReward] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchStatus();
    }
  }, [user?.id]);

  const fetchStatus = async () => {
    try {
      const response = await dailyApi.getStatus(user.id);
      setStatus(response.data);
    } catch (err) {
      console.error('Daily status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!status?.canClaim || claiming) return;

    setClaiming(true);
    hapticFeedback('impact');

    try {
      const response = await dailyApi.claim(user.id);
      setClaimedReward(response.data.reward);
      setShowCelebration(true);
      hapticFeedback('notification');
      
      // Refresh data
      await Promise.all([fetchStatus(), refreshUser()]);
      
      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    } catch (err) {
      console.error('Claim error:', err);
      showAlert('Failed to claim reward. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return <Loading text="Loading daily rewards..." />;
  }

  const currentDay = status?.currentStreak || 0;
  const nextDay = status?.canClaim ? currentDay + 1 : currentDay;

  return (
    <div className="daily-reward-page">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="celebration-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="celebration-content"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <div className="celebration-icon">
                <Gift size={48} />
              </div>
              <h2>Reward Claimed!</h2>
              <div className="celebration-amount">
                <Coins size={24} />
                <span>+{claimedReward}</span>
              </div>
              <p>Come back tomorrow for more!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        className="daily-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="daily-icon">
          <Gift size={32} />
        </div>
        <h1>Daily Rewards</h1>
        <p>Claim your daily reward and build your streak!</p>
      </motion.div>

      {/* Streak Display */}
      <motion.div 
        className="streak-display card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="streak-icon-large">
          <Zap size={28} />
        </div>
        <div className="streak-info">
          <span className="streak-label">Current Streak</span>
          <span className="streak-value">{currentDay} Days</span>
        </div>
      </motion.div>

      {/* Days Grid */}
      <motion.div 
        className="days-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {DAILY_REWARDS.map((reward, index) => {
          const day = index + 1;
          const isPast = day < nextDay;
          const isCurrent = day === nextDay && status?.canClaim;
          const isFuture = day > nextDay;

          return (
            <motion.div
              key={day}
              className={`day-card ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`}
              whileHover={isCurrent ? { scale: 1.05 } : {}}
              whileTap={isCurrent ? { scale: 0.95 } : {}}
            >
              <div className="day-number">Day {day}</div>
              <div className="day-icon">
                {isPast ? (
                  <Check size={24} />
                ) : isCurrent ? (
                  <Star size={24} className="animate-pulse" />
                ) : (
                  <Clock size={20} />
                )}
              </div>
              <div className="day-reward">
                <Coins size={14} />
                <span>+{reward}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Claim Button */}
      <motion.div 
        className="claim-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {status?.canClaim ? (
          <>
            <button 
              className={`claim-button ${claiming ? 'claiming' : ''}`}
              onClick={handleClaim}
              disabled={claiming}
            >
              {claiming ? (
                <>
                  <div className="claim-spinner"></div>
                  <span>Claiming...</span>
                </>
              ) : (
                <>
                  <Gift size={20} />
                  <span>Claim +{status.nextReward} Points</span>
                </>
              )}
            </button>
            <p className="claim-hint">Tap to claim your reward!</p>
          </>
        ) : (
          <div className="claimed-status">
            <Check size={24} />
            <p>Already claimed today!</p>
            <span className="next-claim">Come back tomorrow for more rewards</span>
          </div>
        )}
      </motion.div>

      {/* Tips */}
      <motion.div 
        className="daily-tips card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3>Pro Tips</h3>
        <ul>
          <li>Claim daily to increase your streak</li>
          <li>Higher streaks give bigger rewards</li>
          <li>Missing a day resets your streak</li>
          <li>Day 7 gives 150 points!</li>
        </ul>
      </motion.div>
    </div>
  );
}
