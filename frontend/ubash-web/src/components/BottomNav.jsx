import { NavLink } from 'react-router-dom';
import { Home, Gift, CheckSquare, Users, Trophy, User } from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import './BottomNav.css';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/daily', icon: Gift, label: 'Daily' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/referral', icon: Users, label: 'Invite' },
  { path: '/leaderboard', icon: Trophy, label: 'Ranks' },
];

export default function BottomNav() {
  const { hapticFeedback } = useTelegram();

  const handleClick = () => {
    hapticFeedback('selection');
  };

  return (
    <nav className="bottom-nav safe-area-bottom">
      {navItems.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleClick}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
