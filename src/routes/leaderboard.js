const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('./user');

// Get leaderboard
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type = 'points', limit = 100 } = req.query;
    const currentUser = await User.findOne({ telegramId: req.telegramId });
    
    let sortField = 'points';
    if (type === 'referrals') {
      sortField = 'referralCount';
    } else if (type === 'earned') {
      sortField = 'totalEarned';
    }
    
    const topUsers = await User.find()
      .select('firstName username points totalEarned referralCount level')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));
    
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      name: user.firstName || user.username || 'Anonymous',
      username: user.username,
      points: user.points,
      totalEarned: user.totalEarned,
      referralCount: user.referralCount,
      level: user.level,
      isCurrentUser: currentUser && user.telegramId === currentUser.telegramId
    }));
    
    // Get current user's rank
    let currentUserRank = null;
    if (currentUser) {
      const usersAbove = await User.countDocuments({
        [sortField]: { $gt: currentUser[sortField] }
      });
      currentUserRank = usersAbove + 1;
    }
    
    res.json({
      leaderboard,
      currentUserRank,
      currentUserStats: currentUser ? {
        points: currentUser.points,
        totalEarned: currentUser.totalEarned,
        referralCount: currentUser.referralCount
      } : null,
      totalUsers: await User.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
