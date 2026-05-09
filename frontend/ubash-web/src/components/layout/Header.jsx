import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Settings } from 'lucide-react';
import useStore from '../../store/useStore';
import styles from './Header.module.css';

export function Header({ title, showBack = false, showProfile = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, language } = useStore();
  
  const isHome = location.pathname === '/';
  
  return (
    <header className={styles.header} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.left}>
        {showBack && !isHome && (
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
        )}
        {isHome && user && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user.firstName?.[0] || user.username?.[0] || 'U'}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.greeting}>
                {language === 'ar' ? 'مرحباً' : 'Hello'}
              </span>
              <span className={styles.userName}>
                {user.firstName || user.username || 'User'}
              </span>
            </div>
          </div>
        )}
        {!isHome && title && (
          <h1 className={styles.title}>{title}</h1>
        )}
      </div>
      
      <div className={styles.right}>
        {showProfile && (
          <button 
            className={styles.profileBtn} 
            onClick={() => navigate('/profile')}
          >
            <User size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
