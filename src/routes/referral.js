const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('./user');

// Get referral info
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get list of referred users
    const referredUsers = await User.find({ referredBy: user.telegramId })
      .select('firstName username points createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referralEarnings: user.referralEarnings,
      referredUsers: referredUsers.map(u => ({
        name: u.firstName || u.username || 'Anonymous',
        points: u.points,
        joinedAt: u.createdAt
      })),
      rewardPerReferral: 500
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate referral link
router.get('/link', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const botUsername = process.env.BOT_USERNAME || 'UbashBot';
    const referralLink = `https://t.me/${botUsername}?start=${user.referralCode}`;
    
    res.json({
      referralCode: user.referralCode,
      referralLink,
      shareText: `Join Ubash and earn rewards! Use my referral link: ${referralLink}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
