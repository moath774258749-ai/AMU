const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const bot = require('./bot');
const { router: userRoutes } = require('./routes/user');
const tasksRoutes = require('./routes/tasks');
const dailyRoutes = require('./routes/daily');
const referralRoutes = require('./routes/referral');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.WEBAPP_URL || '*',
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'Ubash API Running',
    version: '1.0.0',
    endpoints: [
      '/api/user',
      '/api/tasks',
      '/api/daily',
      '/api/referral',
      '/api/leaderboard'
    ]
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
      
      // Initialize default data
      const DailyReward = require('./models/DailyReward');
      await DailyReward.initializeDefaults();
      console.log('Default daily rewards initialized');
    } else {
      console.log('No MONGODB_URI provided, running without database');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
  
  // Launch bot
  if (process.env.BOT_TOKEN) {
    bot.launch();
    console.log('Bot running...');
  } else {
    console.log('No BOT_TOKEN provided, bot not started');
  }
};

startServer();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
