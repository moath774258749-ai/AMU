const express = require('express');
const sql = require('../db');

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const users = await sql`
      SELECT 
        telegram_id,
        username,
        first_name,
        last_name,
        photo_url,
        points,
        created_at
      FROM users 
      ORDER BY points DESC 
      LIMIT ${limit}
    `;
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_url: user.photo_url,
      points: user.points
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user rank
router.get('/rank/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    
    const users = await sql`SELECT points FROM users WHERE telegram_id = ${telegram_id}`;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const rank = await sql`
      SELECT COUNT(*) + 1 as rank 
      FROM users 
      WHERE points > ${users[0].points}
    `;
    
    const totalUsers = await sql`SELECT COUNT(*) as total FROM users`;
    
    res.json({
      rank: parseInt(rank[0].rank),
      total_users: parseInt(totalUsers[0].total),
      points: users[0].points
    });
  } catch (error) {
    console.error('Rank error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
