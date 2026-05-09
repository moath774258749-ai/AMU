const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const userRoutes = require('../src/routes/user');
const tasksRoutes = require('../src/routes/tasks');
const dailyRoutes = require('../src/routes/daily');
const referralRoutes = require('../src/routes/referral');
const leaderboardRoutes = require('../src/routes/leaderboard');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data']
}));
app.use(express.json());

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Routes
app.use('/api/user', async (req, res, next) => {
  await connectDB();
  next();
}, userRoutes);

app.use('/api/tasks', async (req, res, next) => {
  await connectDB();
  next();
}, tasksRoutes);

app.use('/api/daily', async (req, res, next) => {
  await connectDB();
  next();
}, dailyRoutes);

app.use('/api/referral', async (req, res, next) => {
  await connectDB();
  next();
}, referralRoutes);

app.use('/api/leaderboard', async (req, res, next) => {
  await connectDB();
  next();
}, leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root API route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Ubash API',
    version: '1.0.0',
    endpoints: ['/api/user', '/api/tasks', '/api/daily', '/api/referral', '/api/leaderboard']
  });
});

module.exports = app;
