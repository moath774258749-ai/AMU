const express = require('express');
const sql = require('../db');

const router = express.Router();

// Get all tasks with completion status for user
router.get('/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    
    const users = await sql`SELECT id FROM users WHERE telegram_id = ${telegram_id}`;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = users[0].id;
    
    const tasks = await sql`
      SELECT t.*, 
             CASE WHEN ut.id IS NOT NULL THEN true ELSE false END as completed,
             ut.completed_at
      FROM tasks t
      LEFT JOIN user_tasks ut ON t.id = ut.task_id AND ut.user_id = ${userId}
      WHERE t.is_active = true
      ORDER BY t.id
    `;
    
    res.json(tasks);
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete a task
router.post('/complete', async (req, res) => {
  try {
    const { telegram_id, task_id } = req.body;
    
    if (!telegram_id || !task_id) {
      return res.status(400).json({ error: 'telegram_id and task_id are required' });
    }
    
    const users = await sql`SELECT id, points FROM users WHERE telegram_id = ${telegram_id}`;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = users[0].id;
    
    // Check if task exists
    const tasks = await sql`SELECT * FROM tasks WHERE id = ${task_id} AND is_active = true`;
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = tasks[0];
    
    // Check if already completed
    const existing = await sql`SELECT id FROM user_tasks WHERE user_id = ${userId} AND task_id = ${task_id}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Task already completed' });
    }
    
    // Complete the task
    await sql`INSERT INTO user_tasks (user_id, task_id) VALUES (${userId}, ${task_id})`;
    
    // Add points
    const newPoints = users[0].points + task.reward;
    await sql`UPDATE users SET points = ${newPoints} WHERE id = ${userId}`;
    
    // Record points history
    await sql`
      INSERT INTO points_history (user_id, amount, action_type, description) 
      VALUES (${userId}, ${task.reward}, 'task', ${task.title})
    `;
    
    res.json({ 
      success: true, 
      reward: task.reward,
      new_points: newPoints
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
