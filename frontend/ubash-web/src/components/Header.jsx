import { useTelegram } from '../context/TelegramContext';
import { Coins } from 'lucide-react';
import './Header.css';

export default function Header() {
  const { dbUser } = useTelegram();

  return (
    <header className="header safe-area-top">
      <div className="header-content">
        <div className="header-logo">
          <div className="logo-icon">U</div>
          <span className="logo-text">UBASH</span>
        </div>
        
        <div className="header-points">
          <Coins size={18} />
          <span className="points-value">
            {dbUser?.points?.toLocaleString() || '0'}
          </span>
        </div>
      </div>
    </header>
  );
}
