const express = require('express');
const sql = require('../db');

const router = express.Router();

// Daily reward amounts based on streak
const DAILY_REWARDS = [10, 20, 30, 50, 75, 100, 150]; // Day 1-7+

// Get daily reward status
router.get('/status/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    
    const users = await sql`SELECT id FROM users WHERE telegram_id = ${telegram_id}`;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = users[0].id;
    
    const rewards = await sql`SELECT * FROM daily_rewards WHERE user_id = ${userId}`;
    
    if (rewards.length === 0) {
      return res.json({
        canClaim: true,
        currentStreak: 0,
        nextReward: DAILY_REWARDS[0],
        lastClaimed: null
      });
    }
    
    const reward = rewards[0];
    const lastClaimed = new Date(reward.last_claimed_at);
    const now = new Date();
    
    // Reset to start of day (UTC)
    const lastClaimedDay = new Date(lastClaimed.toDateString());
    const todayDay = new Date(now.toDateString());
    
    const diffDays = Math.floor((todayDay - lastClaimedDay) / (1000 * 60 * 60 * 24));
    
    let currentStreak = reward.day_streak;
    let canClaim = false;
    
    if (diffDays === 0) {
      // Already claimed today
      canClaim = false;
    } else if (diffDays === 1) {
      // Can claim, streak continues
      canClaim = true;
    } else {
      // Streak broken, reset
      currentStreak = 0;
      canClaim = true;
    }
    
    const nextStreakDay = canClaim ? currentStreak + 1 : currentStreak;
    const nextRewardIndex = Math.min(nextStreakDay, DAILY_REWARDS.length) - 1;
    const nextReward = DAILY_REWARDS[Math.max(0, nextRewardIndex)];
    
    res.json({
      canClaim,
      currentStreak,
      nextReward: canClaim ? nextReward : DAILY_REWARDS[Math.min(currentStreak, DAILY_REWARDS.length - 1)],
      lastClaimed: reward.last_claimed_at,
      streakRewards: DAILY_REWARDS
    });
  } catch (error) {
    console.error('Daily status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Claim daily reward
router.post('/claim', async (req, res) => {
  try {
    const { telegram_id } = req.body;
    
    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }
    
    const users = await sql`SELECT id, points FROM users WHERE telegram_id = ${telegram_id}`;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = users[0].id;
    
    const rewards = await sql`SELECT * FROM daily_rewards WHERE user_id = ${userId}`;
    
    let newStreak = 1;
    let rewardAmount = DAILY_REWARDS[0];
    
    if (rewards.length === 0) {
      // First time claiming
      await sql`INSERT INTO daily_rewards (user_id, day_streak) VALUES (${userId}, 1)`;
    } else {
      const reward = rewards[0];
      const lastClaimed = new Date(reward.last_claimed_at);
      const now = new Date();
      
      const lastClaimedDay = new Date(lastClaimed.toDateString());
      const todayDay = new Date(now.toDateString());
      
      const diffDays = Math.floor((todayDay - lastClaimedDay) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return res.status(400).json({ error: 'Already claimed today' });
      }
      
      if (diffDays === 1) {
        // Streak continues
        newStreak = reward.day_streak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
      
      const rewardIndex = Math.min(newStreak, DAILY_REWARDS.length) - 1;
      rewardAmount = DAILY_REWARDS[rewardIndex];
      
      await sql`
        UPDATE daily_rewards 
        SET day_streak = ${newStreak}, last_claimed_at = NOW() 
        WHERE user_id = ${userId}
      `;
    }
    
    // Add points
    const newPoints = users[0].points + rewardAmount;
    await sql`UPDATE users SET points = ${newPoints} WHERE id = ${userId}`;
    
    // Record in history
    await sql`
      INSERT INTO points_history (user_id, amount, action_type, description) 
      VALUES (${userId}, ${rewardAmount}, 'daily', ${`Day ${newStreak} reward`})
    `;
    
    res.json({
      success: true,
      reward: rewardAmount,
      newStreak,
      newPoints
    });
  } catch (error) {
    console.error('Claim daily error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
