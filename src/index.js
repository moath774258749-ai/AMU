require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bot = require('./bot');

// Import routes
const userRoutes = require('./routes/user');
const tasksRoutes = require('./routes/tasks');
const dailyRoutes = require('./routes/daily');
const referralRoutes = require('./routes/referral');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.WEBAPP_URL || '*',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Ubash API Running', version: '1.0.0' });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

// Launch bot
bot.launch();
console.log('Bot running...');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
