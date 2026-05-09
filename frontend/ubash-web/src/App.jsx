import { useEffect, useState } from "react";
import axios from "axios";
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const initData = tg.initDataUnsafe?.user;

    setUser(initData);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🚀 Ubash Dashboard</h1>

      {user && (
        <div>
          <p>Welcome: {user.first_name}</p>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button>🎁 Daily Reward</button>
        <button>📋 Tasks</button>
        <button>💰 Points</button>
      </div>
      <SpeedInsights />
    </div>
  );
}

export default App;