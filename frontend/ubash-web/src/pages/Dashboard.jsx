import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Coins, TrendingUp, Award, Gift, ListTodo, 
  Users, Trophy, ChevronRight, Zap 
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useStore from '../store/useStore';
import { useTranslation } from '../i18n/translations';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, language, fetchDailyStatus, dailyStatus } = useStore();
  const { t } = useTranslation(language);
  
  useEffect(() => {
    fetchDailyStatus();
  }, []);
  
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };
  
  const quickActions = [
    { 
      icon: Gift, 
      label: t('dashboard.dailyReward'), 
      path: '/daily',
      color: 'success',
      badge: dailyStatus?.canClaim ? '!' : null
    },
    { 
      icon: ListTodo, 
      label: t('dashboard.completeTasks'), 
      path: '/tasks',
      color: 'primary'
    },
    { 
      icon: Users, 
      label: t('dashboard.inviteFriends'), 
      path: '/friends',
      color: 'secondary'
    },
    { 
      icon: Trophy, 
      label: t('dashboard.viewLeaderboard'), 
      path: '/leaderboard',
      color: 'warning'
    }
  ];
  
  return (
    <div className={styles.dashboard} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header showBack={false} />
      
      <div className={styles.content}>
        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="highlight" className={styles.pointsCard}>
            <CardContent className={styles.pointsContent}>
              <div className={styles.pointsHeader}>
                <span className={styles.pointsLabel}>{t('dashboard.totalPoints')}</span>
                <Coins className={styles.pointsIcon} size={24} />
              </div>
              <div className={styles.pointsValue}>
                <span className={styles.pointsNumber}>
                  {formatNumber(user?.points || 0)}
                </span>
                <span className={styles.pointsUnit}>UBP</span>
              </div>
              <div className={styles.pointsFooter}>
                <div className={styles.statItem}>
                  <TrendingUp size={16} className={styles.statIcon} />
                  <span>{t('dashboard.level')} {user?.level || 1}</span>
                </div>
                <div className={styles.statItem}>
                  <Award size={16} className={styles.statIcon} />
                  <span>{formatNumber(user?.totalEarned || 0)} {t('dashboard.totalEarned')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Daily Streak Banner */}
        {dailyStatus?.canClaim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.streakBanner}
            onClick={() => navigate('/daily')}
          >
            <div className={styles.streakContent}>
              <Zap className={styles.streakIcon} size={24} />
              <div className={styles.streakText}>
                <span className={styles.streakTitle}>
                  {language === 'ar' ? 'المكافأة اليومية متاحة!' : 'Daily Reward Available!'}
                </span>
                <span className={styles.streakSubtitle}>
                  {language === 'ar' ? 'اضغط للاستلام' : 'Tap to claim'}
                </span>
              </div>
            </div>
            <ChevronRight size={20} />
          </motion.div>
        )}
        
        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>{t('dashboard.quickActions')}</h2>
          <div className={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card
                  variant="interactive"
                  className={styles.actionCard}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className={styles.actionContent}>
                    <div className={`${styles.actionIcon} ${styles[action.color]}`}>
                      <action.icon size={22} />
                      {action.badge && (
                        <span className={styles.badge}>{action.badge}</span>
                      )}
                    </div>
                    <span className={styles.actionLabel}>{action.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
        
        {/* Stats Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={styles.section}
        >
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{user?.dailyStreak || 0}</span>
              <span className={styles.statLabel}>
                {language === 'ar' ? 'أيام متتالية' : 'Day Streak'}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{user?.referralCount || 0}</span>
              <span className={styles.statLabel}>
                {language === 'ar' ? 'الدعوات' : 'Referrals'}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{user?.completedTasks?.length || 0}</span>
              <span className={styles.statLabel}>
                {language === 'ar' ? 'المهام' : 'Tasks'}
              </span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
