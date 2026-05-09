const express = require('express');
const sql = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Generate random referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get or create user
router.post('/auth', async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name, photo_url, referral_code } = req.body;
    
    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }
    
    // Check if user exists
    let users = await sql`SELECT * FROM users WHERE telegram_id = ${telegram_id}`;
    
    if (users.length === 0) {
      // Create new user
      const newReferralCode = generateReferralCode();
      
      // Check if referred by someone
      let referredById = null;
      if (referral_code) {
        const referrer = await sql`SELECT id FROM users WHERE referral_code = ${referral_code}`;
        if (referrer.length > 0) {
          referredById = referrer[0].id;
        }
      }
      
      const result = await sql`
        INSERT INTO users (telegram_id, username, first_name, last_name, photo_url, referral_code, referred_by, points)
        VALUES (${telegram_id}, ${username || null}, ${first_name || null}, ${last_name || null}, ${photo_url || null}, ${newReferralCode}, ${referredById}, 0)
        RETURNING *
      `;
      
      // If referred, give bonus points to both users
      if (referredById) {
        // Give referrer 100 points
        await sql`UPDATE users SET points = points + 100 WHERE id = ${referredById}`;
        await sql`INSERT INTO points_history (user_id, amount, action_type, description) VALUES (${referredById}, 100, 'referral', 'Referred a new user')`;
        
        // Give new user 50 points
        await sql`UPDATE users SET points = points + 50 WHERE id = ${result[0].id}`;
        await sql`INSERT INTO points_history (user_id, amount, action_type, description) VALUES (${result[0].id}, 50, 'referral_bonus', 'Joined via referral')`;
        result[0].points = 50;
      }
      
      return res.json({ user: result[0], isNew: true });
    }
    
    // Update existing user info
    const updated = await sql`
      UPDATE users 
      SET username = COALESCE(${username}, username),
          first_name = COALESCE(${first_name}, first_name),
          last_name = COALESCE(${last_name}, last_name),
          photo_url = COALESCE(${photo_url}, photo_url),
          updated_at = NOW()
      WHERE telegram_id = ${telegram_id}
      RETURNING *
    `;
    
    res.json({ user: updated[0], isNew: false });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    
    const users = await sql`SELECT * FROM users WHERE telegram_id = ${telegram_id}`;
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get referral count
    const referralCount = await sql`SELECT COUNT(*) as count FROM users WHERE referred_by = ${users[0].id}`;
    
    // Get rank
    const rank = await sql`
      SELECT COUNT(*) + 1 as rank 
      FROM users 
      WHERE points > ${users[0].points}
    `;
    
    res.json({
      ...users[0],
      referral_count: parseInt(referralCount[0].count),
      rank: parseInt(rank[0].rank)
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get points history
router.get('/points-history/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    
    const users = await sql`SELECT id FROM users WHERE telegram_id = ${telegram_id}`;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const history = await sql`
      SELECT * FROM points_history 
      WHERE user_id = ${users[0].id} 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    
    res.json(history);
  } catch (error) {
    console.error('Points history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
