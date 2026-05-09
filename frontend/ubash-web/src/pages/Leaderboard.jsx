import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Coins, Users, Crown, Star } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/Card';
import useStore from '../store/useStore';
import { useTranslation } from '../i18n/translations';
import styles from './Leaderboard.module.css';

export function Leaderboard() {
  const { leaderboard, leaderboardLoading, fetchLeaderboard, language } = useStore();
  const { t } = useTranslation(language);
  const [activeTab, setActiveTab] = useState('points');
  
  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);
  
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };
  
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown size={20} className={styles.gold} />;
      case 2: return <Medal size={20} className={styles.silver} />;
      case 3: return <Medal size={20} className={styles.bronze} />;
      default: return <span className={styles.rankNumber}>{rank}</span>;
    }
  };
  
  const tabs = [
    { id: 'points', label: t('leaderboard.byPoints'), icon: Coins },
    { id: 'referrals', label: t('leaderboard.byReferrals'), icon: Users }
  ];
  
  const topThree = leaderboard?.leaderboard?.slice(0, 3) || [];
  const restUsers = leaderboard?.leaderboard?.slice(3) || [];
  
  return (
    <div className={styles.page} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header title={t('leaderboard.title')} showBack />
      
      <div className={styles.content}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Your Rank */}
        {leaderboard?.currentUserRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="highlight" className={styles.yourRankCard}>
              <CardContent className={styles.yourRankContent}>
                <div className={styles.yourRankLeft}>
                  <Star size={24} className={styles.yourRankIcon} />
                  <div className={styles.yourRankInfo}>
                    <span className={styles.yourRankLabel}>{t('leaderboard.yourRank')}</span>
                    <span className={styles.yourRankValue}>
                      #{leaderboard.currentUserRank}
                    </span>
                  </div>
                </div>
                <div className={styles.yourRankStats}>
                  <span className={styles.yourRankPoints}>
                    {formatNumber(leaderboard.currentUserStats?.points)} pts
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.podium}
          >
            {/* Second Place */}
            {topThree[1] && (
              <div className={`${styles.podiumItem} ${styles.second}`}>
                <div className={styles.podiumAvatar}>
                  <Medal size={16} className={styles.silver} />
                </div>
                <span className={styles.podiumName}>{topThree[1].name}</span>
                <span className={styles.podiumScore}>
                  {formatNumber(activeTab === 'points' ? topThree[1].points : topThree[1].referralCount)}
                </span>
                <div className={styles.podiumBar}></div>
              </div>
            )}
            
            {/* First Place */}
            {topThree[0] && (
              <div className={`${styles.podiumItem} ${styles.first}`}>
                <div className={styles.podiumAvatar}>
                  <Crown size={20} className={styles.gold} />
                </div>
                <span className={styles.podiumName}>{topThree[0].name}</span>
                <span className={styles.podiumScore}>
                  {formatNumber(activeTab === 'points' ? topThree[0].points : topThree[0].referralCount)}
                </span>
                <div className={styles.podiumBar}></div>
              </div>
            )}
            
            {/* Third Place */}
            {topThree[2] && (
              <div className={`${styles.podiumItem} ${styles.third}`}>
                <div className={styles.podiumAvatar}>
                  <Medal size={16} className={styles.bronze} />
                </div>
                <span className={styles.podiumName}>{topThree[2].name}</span>
                <span className={styles.podiumScore}>
                  {formatNumber(activeTab === 'points' ? topThree[2].points : topThree[2].referralCount)}
                </span>
                <div className={styles.podiumBar}></div>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Leaderboard List */}
        {restUsers.length > 0 && (
          <div className={styles.list}>
            {restUsers.map((user, index) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.03 }}
                className={`${styles.listItem} ${user.isCurrentUser ? styles.currentUser : ''}`}
              >
                <div className={styles.listRank}>
                  {getRankIcon(user.rank)}
                </div>
                <div className={styles.listAvatar}>
                  {user.name?.[0] || 'U'}
                </div>
                <div className={styles.listInfo}>
                  <span className={styles.listName}>{user.name}</span>
                  <span className={styles.listLevel}>Lv.{user.level || 1}</span>
                </div>
                <div className={styles.listScore}>
                  <Coins size={14} />
                  <span>
                    {formatNumber(activeTab === 'points' ? user.points : user.referralCount)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!leaderboardLoading && (!leaderboard?.leaderboard || leaderboard.leaderboard.length === 0) && (
          <div className={styles.emptyState}>
            <Trophy size={48} className={styles.emptyIcon} />
            <p>{t('leaderboard.noData')}</p>
          </div>
        )}
        
        {/* Total Users */}
        {leaderboard?.totalUsers && (
          <div className={styles.totalUsers}>
            {formatNumber(leaderboard.totalUsers)} {language === 'ar' ? 'مستخدم نشط' : 'active users'}
          </div>
        )}
      </div>
    </div>
  );
}
