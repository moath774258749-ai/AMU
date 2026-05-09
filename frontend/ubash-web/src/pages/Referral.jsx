import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Copy, 
  Check, 
  Gift, 
  Coins,
  Share2,
  UserPlus,
  Crown
} from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { referralApi } from '../services/api';
import Loading from '../components/Loading';
import './Referral.css';

export default function Referral() {
  const { user, hapticFeedback, tg } = useTelegram();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchReferralData();
    }
  }, [user?.id]);

  const fetchReferralData = async () => {
    try {
      const response = await referralApi.getInfo(user.id);
      setReferralData(response.data);
    } catch (err) {
      console.error('Referral error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!referralData?.referral_link) return;

    hapticFeedback('impact');

    try {
      await navigator.clipboard.writeText(referralData.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const handleShare = () => {
    if (!referralData?.referral_link) return;

    hapticFeedback('impact');

    const shareText = `Join me on UBASH and earn rewards! Use my referral link: ${referralData.referral_link}`;

    if (tg?.openTelegramLink) {
      // Share via Telegram
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralData.referral_link)}&text=${encodeURIComponent('Join me on UBASH and earn rewards!')}`;
      tg.openTelegramLink(shareUrl);
    } else if (navigator.share) {
      navigator.share({
        title: 'Join UBASH',
        text: shareText,
        url: referralData.referral_link,
      });
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return <Loading text="Loading referral info..." />;
  }

  return (
    <div className="referral-page">
      {/* Header */}
      <motion.div 
        className="referral-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="referral-icon">
          <Users size={32} />
        </div>
        <h1>Invite Friends</h1>
        <p>Earn 100 points for each friend who joins!</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="referral-stats"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat-card card">
          <UserPlus size={24} className="stat-icon" />
          <div className="stat-value">{referralData?.total_referrals || 0}</div>
          <div className="stat-label">Total Invites</div>
        </div>
        <div className="stat-card card">
          <Coins size={24} className="stat-icon earnings" />
          <div className="stat-value">{referralData?.total_earnings || 0}</div>
          <div className="stat-label">Points Earned</div>
        </div>
      </motion.div>

      {/* Referral Link */}
      <motion.div 
        className="referral-link-section card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3>Your Referral Link</h3>
        <div className="referral-link-box">
          <input 
            type="text" 
            value={referralData?.referral_link || ''} 
            readOnly 
            className="referral-input"
          />
          <button 
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopyLink}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        
        <div className="share-buttons">
          <button className="btn btn-primary share-btn" onClick={handleShare}>
            <Share2 size={18} />
            Share Link
          </button>
          <button className="btn btn-secondary copy-link-btn" onClick={handleCopyLink}>
            <Copy size={18} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div 
        className="how-it-works card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3>How It Works</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Share Your Link</h4>
              <p>Send your referral link to friends</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Friends Join</h4>
              <p>They open the link and join UBASH</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Earn Rewards</h4>
              <p>You get 100 points, they get 50!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Referral List */}
      {referralData?.referrals?.length > 0 && (
        <motion.div 
          className="referrals-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Your Referrals</h3>
          <div className="referral-items">
            {referralData.referrals.map((referral, index) => (
              <div key={index} className="referral-item card">
                <div className="referral-avatar">
                  {referral.first_name?.[0] || 'U'}
                </div>
                <div className="referral-info">
                  <span className="referral-name">
                    {referral.first_name || referral.username || 'User'}
                  </span>
                  <span className="referral-date">
                    Joined {new Date(referral.joined_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="referral-points">
                  <Coins size={14} />
                  <span>{referral.points}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bonus Banner */}
      <motion.div 
        className="bonus-banner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Gift size={24} />
        <div>
          <h4>Invite More, Earn More!</h4>
          <p>Top referrers get bonus rewards each week</p>
        </div>
      </motion.div>
    </div>
  );
}
