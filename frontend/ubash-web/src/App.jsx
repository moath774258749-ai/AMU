import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TelegramProvider } from './context/TelegramContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import DailyReward from './pages/DailyReward';
import Tasks from './pages/Tasks';
import Referral from './pages/Referral';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import './styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <TelegramProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/daily" element={<DailyReward />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </TelegramProvider>
    </BrowserRouter>
  );
}

export default App;
