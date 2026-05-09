import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check, Coins, Flame, Clock, Sparkles } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useStore from '../store/useStore';
import { useTranslation } from '../i18n/translations';
import styles from './Daily.module.css';

export function Daily() {
  const { dailyStatus, dailyLoading, fetchDailyStatus, claimDailyReward, language } = useStore();
  const { t } = useTranslation(language);
  const [claiming, setClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimedReward, setClaimedReward] = useState(null);
  const [countdown, setCountdown] = useState(null);
  
  useEffect(() => {
    fetchDailyStatus();
  }, []);
  
  // Countdown timer
  useEffect(() => {
    if (dailyStatus?.nextClaimTime && !dailyStatus.canClaim) {
      const updateCountdown = () => {
        const now = new Date();
        const next = new Date(dailyStatus.nextClaimTime);
        const diff = next - now;
        
        if (diff <= 0) {
          setCountdown(null);
          fetchDailyStatus();
          return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown({ hours, minutes, seconds });
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [dailyStatus?.nextClaimTime, dailyStatus?.canClaim]);
  
  const handleClaim = async () => {
    setClaiming(true);
    try {
      const result = await claimDailyReward();
      setClaimedReward(result);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setClaimedReward(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to claim:', error);
    } finally {
      setClaiming(false);
    }
  };
  
  return (
    <div className={styles.page} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header title={t('daily.title')} showBack />
      
      <div className={styles.content}>
        <p className={styles.subtitle}>{t('daily.subtitle')}</p>
        
        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="highlight" className={styles.streakCard}>
            <CardContent className={styles.streakContent}>
              <div className={styles.streakIcon}>
                <Flame size={32} />
              </div>
              <div className={styles.streakInfo}>
                <span className={styles.streakLabel}>{t('daily.streak')}</span>
                <span className={styles.streakValue}>
                  {dailyStatus?.streak || 0} {language === 'ar' ? 'يوم' : 'Days'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Countdown or Claim Button */}
        {!dailyStatus?.canClaim && countdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.countdownSection}
          >
            <Clock size={20} className={styles.clockIcon} />
            <span className={styles.countdownLabel}>{t('daily.nextReward')}</span>
            <div className={styles.countdown}>
              <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className={styles.countdownUnit}>{t('daily.hours')}</span>
              </div>
              <span className={styles.countdownSeparator}>:</span>
              <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className={styles.countdownUnit}>{t('daily.minutes')}</span>
              </div>
              <span className={styles.countdownSeparator}>:</span>
              <div className={styles.countdownItem}>
                <span className={styles.countdownValue}>
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className={styles.countdownUnit}>sec</span>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Day Cards */}
        <div className={styles.daysGrid}>
          {dailyStatus?.rewards?.map((reward, index) => (
            <motion.div
              key={reward.day}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                ${styles.dayCard}
                ${reward.isCompleted ? styles.completed : ''}
                ${reward.isCurrent ? styles.current : ''}
                ${reward.isSpecial ? styles.special : ''}
              `}
            >
              <span className={styles.dayNumber}>
                {t('daily.day')} {reward.day}
              </span>
              <div className={styles.dayIcon}>
                {reward.isCompleted ? (
                  <Check size={24} />
                ) : reward.isSpecial ? (
                  <Sparkles size={24} />
                ) : (
                  <Gift size={24} />
                )}
              </div>
              <div className={styles.dayReward}>
                <Coins size={14} />
                <span>{reward.reward + reward.bonus}</span>
              </div>
              {reward.isSpecial && (
                <span className={styles.specialBadge}>
                  {t('daily.specialBonus')}
                </span>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Claim Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.claimSection}
        >
          <Button
            variant={dailyStatus?.canClaim ? 'gradient' : 'ghost'}
            size="lg"
            fullWidth
            disabled={!dailyStatus?.canClaim}
            loading={claiming}
            onClick={handleClaim}
            icon={dailyStatus?.canClaim ? <Gift size={20} /> : <Clock size={20} />}
          >
            {dailyStatus?.canClaim ? t('daily.claimNow') : t('daily.alreadyClaimed')}
          </Button>
        </motion.div>
      </div>
      
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && claimedReward && (
          <motion.div
            className={styles.successModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.successContent}
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <div className={styles.successIcon}>
                <Sparkles size={48} />
              </div>
              <h2 className={styles.successTitle}>
                {language === 'ar' ? 'مبروك!' : 'Congratulations!'}
              </h2>
              <div className={styles.successReward}>
                <Coins size={24} />
                <span>+{claimedReward.reward}</span>
              </div>
              <p className={styles.successText}>
                {t('daily.day')} {claimedReward.day} {t('common.claimed')}
                {claimedReward.isSpecial && ` - ${t('daily.specialBonus')}`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
