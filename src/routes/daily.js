const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DailyReward = require('../models/DailyReward');
const { authMiddleware } = require('./user');

// Get daily reward status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const rewards = await DailyReward.find().sort({ day: 1 });
    const now = new Date();
    
    let canClaim = true;
    let nextClaimTime = null;
    let currentDay = user.dailyStreak + 1;
    
    if (user.lastDailyReward) {
      const lastClaim = new Date(user.lastDailyReward);
      const hoursSinceClaim = (now - lastClaim) / (1000 * 60 * 60);
      
      if (hoursSinceClaim < 24) {
        canClaim = false;
        nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
      } else if (hoursSinceClaim > 48) {
        // Streak broken
        currentDay = 1;
      }
    }
    
    // Reset after day 7
    if (currentDay > 7) {
      currentDay = 1;
    }
    
    const rewardsWithStatus = rewards.map(r => ({
      day: r.day,
      reward: r.reward,
      bonus: r.bonus,
      isSpecial: r.isSpecial,
      isCurrent: r.day === currentDay,
      isCompleted: r.day < currentDay || (r.day === currentDay && !canClaim && user.dailyStreak >= r.day)
    }));
    
    res.json({
      canClaim,
      currentDay,
      streak: user.dailyStreak,
      nextClaimTime,
      rewards: rewardsWithStatus
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Claim daily reward
router.post('/claim', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date();
    let currentDay = user.dailyStreak + 1;
    
    if (user.lastDailyReward) {
      const lastClaim = new Date(user.lastDailyReward);
      const hoursSinceClaim = (now - lastClaim) / (1000 * 60 * 60);
      
      if (hoursSinceClaim < 24) {
        return res.status(400).json({ 
          error: 'Already claimed today',
          nextClaimTime: new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
        });
      }
      
      if (hoursSinceClaim > 48) {
        currentDay = 1;
        user.dailyStreak = 0;
      }
    }
    
    if (currentDay > 7) {
      currentDay = 1;
      user.dailyStreak = 0;
    }
    
    const dailyReward = await DailyReward.findOne({ day: currentDay });
    if (!dailyReward) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    const totalReward = dailyReward.reward + dailyReward.bonus;
    
    user.points += totalReward;
    user.totalEarned += totalReward;
    user.lastDailyReward = now;
    user.dailyStreak = currentDay;
    user.pointsHistory.push({
      amount: totalReward,
      type: 'daily',
      description: `Day ${currentDay} reward${dailyReward.isSpecial ? ' (Special!)' : ''}`
    });
    
    await user.save();
    
    res.json({
      success: true,
      reward: totalReward,
      day: currentDay,
      isSpecial: dailyReward.isSpecial,
      newBalance: user.points,
      newStreak: user.dailyStreak
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize daily rewards
router.post('/admin/init', async (req, res) => {
  try {
    await DailyReward.initializeDefaults();
    res.json({ message: 'Daily rewards initialized' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
