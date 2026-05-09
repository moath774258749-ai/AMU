const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  languageCode: { type: String, default: 'en' },
  photoUrl: { type: String, default: '' },
  points: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: null },
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },
  lastDailyReward: { type: Date, default: null },
  dailyStreak: { type: Number, default: 0 },
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  pointsHistory: [{
    amount: Number,
    type: { type: String, enum: ['task', 'daily', 'referral', 'bonus'] },
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate unique referral code
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = 'UB' + this.telegramId.slice(-6).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);
