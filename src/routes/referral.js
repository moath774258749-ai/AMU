const express = require('express');
const sql = require('../db');

const router = express.Router();

// Get referral info
router.get('/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    
    const users = await sql`SELECT * FROM users WHERE telegram_id = ${telegram_id}`;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Get referrals
    const referrals = await sql`
      SELECT id, username, first_name, created_at, points
      FROM users 
      WHERE referred_by = ${user.id}
      ORDER BY created_at DESC
    `;
    
    // Calculate total earned from referrals
    const referralEarnings = await sql`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM points_history 
      WHERE user_id = ${user.id} AND action_type = 'referral'
    `;
    
    res.json({
      referral_code: user.referral_code,
      referral_link: `https://t.me/UbashBot?start=${user.referral_code}`,
      total_referrals: referrals.length,
      total_earnings: parseInt(referralEarnings[0].total),
      referrals: referrals.map(r => ({
        username: r.username,
        first_name: r.first_name,
        joined_at: r.created_at,
        points: r.points
      }))
    });
  } catch (error) {
    console.error('Referral error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
