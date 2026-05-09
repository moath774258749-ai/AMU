import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Coins, Calendar, History, 
  Globe, ChevronRight, Gift, ListTodo,
  Users, Star
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/Card';
import useStore from '../store/useStore';
import { useTranslation } from '../i18n/translations';
import { userApi } from '../services/api';
import styles from './Profile.module.css';

const typeIcons = {
  task: ListTodo,
  daily: Gift,
  referral: Users,
  bonus: Star
};

export function Profile() {
  const { user, language, setLanguage } = useStore();
  const { t } = useTranslation(language);
  const [history, setHistory] = useState([]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = async () => {
    try {
      const response = await userApi.getPointsHistory();
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };
  
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long'
      })
    : '-';
  
  return (
    <div className={styles.page} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header title={t('profile.title')} showBack showProfile={false} />
      
      <div className={styles.content}>
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={styles.profileCard}>
            <CardContent className={styles.profileContent}>
              <div className={styles.avatar}>
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <h2 className={styles.userName}>
                {user?.firstName || user?.username || 'User'}
                {user?.lastName && ` ${user.lastName}`}
              </h2>
              {user?.username && (
                <span className={styles.userHandle}>@{user.username}</span>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.statsGrid}
        >
          <div className={styles.statItem}>
            <Coins size={20} className={styles.statIcon} />
            <span className={styles.statValue}>{formatNumber(user?.points)}</span>
            <span className={styles.statLabel}>{t('common.points')}</span>
          </div>
          <div className={styles.statItem}>
            <Star size={20} className={styles.statIcon} />
            <span className={styles.statValue}>{formatNumber(user?.totalEarned)}</span>
            <span className={styles.statLabel}>{t('profile.totalEarned')}</span>
          </div>
          <div className={styles.statItem}>
            <Calendar size={20} className={styles.statIcon} />
            <span className={styles.statValue}>{user?.dailyStreak || 0}</span>
            <span className={styles.statLabel}>Streak</span>
          </div>
        </motion.div>
        
        {/* Member Since */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={styles.infoCard}>
            <CardContent className={styles.infoContent}>
              <Calendar size={20} />
              <span>{t('profile.memberSince')}</span>
              <span className={styles.infoValue}>{memberSince}</span>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.section}
        >
          <h3 className={styles.sectionTitle}>{t('profile.settings')}</h3>
          <Card className={styles.settingsCard}>
            <CardContent className={styles.settingsList}>
              <button 
                className={styles.settingItem}
                onClick={() => setShowLanguageModal(true)}
              >
                <div className={styles.settingLeft}>
                  <Globe size={20} />
                  <span>{t('profile.language')}</span>
                </div>
                <div className={styles.settingRight}>
                  <span className={styles.settingValue}>
                    {language === 'ar' ? 'العربية' : 'English'}
                  </span>
                  <ChevronRight size={18} />
                </div>
              </button>
            </CardContent>
          </Card>
        </motion.section>
        
        {/* Points History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={styles.section}
        >
          <h3 className={styles.sectionTitle}>
            <History size={18} />
            {t('profile.history')}
          </h3>
          
          {history.length > 0 ? (
            <div className={styles.historyList}>
              {history.map((item, index) => {
                const Icon = typeIcons[item.type] || Star;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.03 }}
                    className={styles.historyItem}
                  >
                    <div className={`${styles.historyIcon} ${styles[item.type]}`}>
                      <Icon size={18} />
                    </div>
                    <div className={styles.historyInfo}>
                      <span className={styles.historyDesc}>{item.description}</span>
                      <span className={styles.historyDate}>{formatDate(item.createdAt)}</span>
                    </div>
                    <span className={styles.historyAmount}>+{item.amount}</span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyHistory}>
              <History size={32} />
              <p>{t('profile.noHistory')}</p>
            </div>
          )}
        </motion.section>
      </div>
      
      {/* Language Modal */}
      {showLanguageModal && (
        <div className={styles.modal} onClick={() => setShowLanguageModal(false)}>
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>{t('profile.language')}</h3>
            <div className={styles.languageOptions}>
              <button
                className={`${styles.langOption} ${language === 'en' ? styles.active : ''}`}
                onClick={() => {
                  setLanguage('en');
                  setShowLanguageModal(false);
                }}
              >
                <span className={styles.langFlag}>EN</span>
                <span>English</span>
              </button>
              <button
                className={`${styles.langOption} ${language === 'ar' ? styles.active : ''}`}
                onClick={() => {
                  setLanguage('ar');
                  setShowLanguageModal(false);
                }}
              >
                <span className={styles.langFlag}>AR</span>
                <span>العربية</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
