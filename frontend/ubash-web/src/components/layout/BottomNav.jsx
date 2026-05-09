import { NavLink } from 'react-router-dom';
import { Home, ListTodo, Gift, Users, Trophy, User } from 'lucide-react';
import { useTranslation } from '../../i18n/translations';
import useStore from '../../store/useStore';
import styles from './BottomNav.module.css';

export function BottomNav() {
  const { language } = useStore();
  const { t } = useTranslation(language);
  
  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/tasks', icon: ListTodo, label: t('nav.tasks') },
    { to: '/daily', icon: Gift, label: t('nav.daily') },
    { to: '/friends', icon: Users, label: t('nav.friends') },
    { to: '/leaderboard', icon: Trophy, label: t('nav.leaderboard') }
  ];
  
  return (
    <nav className={styles.nav} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <item.icon className={styles.icon} size={22} />
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
