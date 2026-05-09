const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

// Verify Telegram WebApp initData
function verifyTelegramData(initData, botToken) {
  if (!initData || !botToken) return { valid: false };
  
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    if (calculatedHash === hash) {
      const userParam = params.get('user');
      if (userParam) {
        return { valid: true, user: JSON.parse(userParam) };
      }
    }
    return { valid: false };
  } catch (e) {
    return { valid: false };
  }
}

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const initData = req.headers['x-telegram-init-data'];
  const devMode = process.env.NODE_ENV === 'development';
  
  // In development, allow passing telegramId directly
  if (devMode && req.headers['x-telegram-id']) {
    req.telegramId = req.headers['x-telegram-id'];
    req.telegramUser = {
      id: req.headers['x-telegram-id'],
      first_name: req.headers['x-telegram-firstname'] || 'Dev User',
      username: req.headers['x-telegram-username'] || 'devuser'
    };
    return next();
  }
  
  const { valid, user } = verifyTelegramData(initData, process.env.BOT_TOKEN);
  
  if (!valid && !devMode) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (user) {
    req.telegramId = user.id.toString();
    req.telegramUser = user;
  }
  
  next();
};

// Get or create user
router.post('/auth', authMiddleware, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(400).json({ error: 'No user data' });
    }
    
    let user = await User.findOne({ telegramId: telegramUser.id.toString() });
    
    if (!user) {
      // New user
      const userData = {
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || '',
        firstName: telegramUser.first_name || '',
        lastName: telegramUser.last_name || '',
        languageCode: telegramUser.language_code || 'en',
        photoUrl: telegramUser.photo_url || ''
      };
      
      // Handle referral
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer && referrer.telegramId !== telegramUser.id.toString()) {
          userData.referredBy = referrer.telegramId;
          
          // Reward referrer
          const referralReward = 500;
          referrer.points += referralReward;
          referrer.totalEarned += referralReward;
          referrer.referralCount += 1;
          referrer.referralEarnings += referralReward;
          referrer.pointsHistory.push({
            amount: referralReward,
            type: 'referral',
            description: `Referral bonus for inviting ${telegramUser.first_name || 'new user'}`
          });
          await referrer.save();
          
          // Give new user a bonus too
          userData.points = 200;
          userData.totalEarned = 200;
          userData.pointsHistory = [{
            amount: 200,
            type: 'bonus',
            description: 'Welcome bonus for joining via referral'
          }];
        }
      }
      
      user = new User(userData);
      await user.save();
    } else {
      // Update existing user info
      user.username = telegramUser.username || user.username;
      user.firstName = telegramUser.first_name || user.firstName;
      user.lastName = telegramUser.last_name || user.lastName;
      user.photoUrl = telegramUser.photo_url || user.photoUrl;
      await user.save();
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get points history
router.get('/points-history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const history = user.pointsHistory.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
    res.json({ history, totalEarned: user.totalEarned });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, authMiddleware };
