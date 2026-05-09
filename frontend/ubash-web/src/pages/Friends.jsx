import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Copy, Share2, Gift, Coins, 
  Check, Link, UserPlus, ChevronRight
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useStore from '../store/useStore';
import { useTranslation } from '../i18n/translations';
import styles from './Friends.module.css';

export function Friends() {
  const { referralInfo, referralLink, fetchReferralInfo, language } = useStore();
  const { t } = useTranslation(language);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    fetchReferralInfo();
  }, []);
  
  const handleCopy = async () => {
    if (referralLink?.referralLink) {
      try {
        await navigator.clipboard.writeText(referralLink.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = referralLink.referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };
  
  const handleShare = async () => {
    if (referralLink?.referralLink) {
      const shareData = {
        title: 'Ubash',
        text: referralLink.shareText || t('referral.shareMessage'),
        url: referralLink.referralLink
      };
      
      // Try Telegram share first
      const tg = window.Telegram?.WebApp;
      if (tg?.openTelegramLink) {
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink.referralLink)}&text=${encodeURIComponent(shareData.text)}`;
        tg.openTelegramLink(telegramShareUrl);
        return;
      }
      
      // Fallback to Web Share API
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== 'AbortError') {
            handleCopy();
          }
        }
      } else {
        handleCopy();
      }
    }
  };
  
  const howItWorks = [
    { icon: Link, text: t('referral.step1') },
    { icon: UserPlus, text: t('referral.step2') },
    { icon: Gift, text: t('referral.step3') }
  ];
  
  return (
    <div className={styles.page} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header title={t('referral.title')} showBack />
      
      <div className={styles.content}>
        <p className={styles.subtitle}>{t('referral.subtitle')}</p>
        
        {/* Stats Cards */}
        <div className={styles.statsRow}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.statCard}
          >
            <Users size={24} className={styles.statIcon} />
            <span className={styles.statValue}>
              {referralInfo?.referralCount || 0}
            </span>
            <span className={styles.statLabel}>{t('referral.totalReferrals')}</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.statCard}
          >
            <Coins size={24} className={styles.statIcon} />
            <span className={styles.statValue}>
              {referralInfo?.referralEarnings || 0}
            </span>
            <span className={styles.statLabel}>{t('referral.totalEarnings')}</span>
          </motion.div>
        </div>
        
        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={styles.linkCard}>
            <CardContent>
              <h3 className={styles.linkTitle}>{t('referral.yourLink')}</h3>
              <div className={styles.linkBox}>
                <span className={styles.linkText}>
                  {referralLink?.referralLink || '...'}
                </span>
              </div>
              <div className={styles.linkActions}>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleCopy}
                  icon={copied ? <Check size={18} /> : <Copy size={18} />}
                >
                  {copied ? t('common.copied') : t('common.copy')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleShare}
                  icon={<Share2 size={18} />}
                >
                  {t('common.share')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>{t('referral.howItWorks')}</h2>
          <div className={styles.steps}>
            {howItWorks.map((step, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.stepIcon}>
                  <step.icon size={20} />
                </div>
                <span className={styles.stepText}>{step.text}</span>
                {index < howItWorks.length - 1 && (
                  <ChevronRight size={16} className={styles.stepArrow} />
                )}
              </div>
            ))}
          </div>
        </motion.section>
        
        {/* Reward Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="highlight" className={styles.rewardCard}>
            <CardContent className={styles.rewardContent}>
              <Gift size={32} className={styles.rewardIcon} />
              <div className={styles.rewardInfo}>
                <span className={styles.rewardValue}>
                  +{referralInfo?.rewardPerReferral || 500}
                </span>
                <span className={styles.rewardLabel}>
                  {language === 'ar' ? 'نقطة لكل صديق' : 'points per friend'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Invited Friends List */}
        {referralInfo?.referredUsers?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.section}
          >
            <h2 className={styles.sectionTitle}>
              {t('referral.invitedFriends')} ({referralInfo.referredUsers.length})
            </h2>
            <div className={styles.friendsList}>
              {referralInfo.referredUsers.map((friend, index) => (
                <div key={index} className={styles.friendItem}>
                  <div className={styles.friendAvatar}>
                    {friend.name?.[0] || 'U'}
                  </div>
                  <div className={styles.friendInfo}>
                    <span className={styles.friendName}>{friend.name}</span>
                    <span className={styles.friendPoints}>
                      {friend.points} {t('common.points')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
