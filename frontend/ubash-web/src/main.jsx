import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Initialize Telegram WebApp as early as possible
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
