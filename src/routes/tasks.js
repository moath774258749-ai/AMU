const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { authMiddleware } = require('./user');

// Get all active tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.telegramId });
    const tasks = await Task.find({ isActive: true }).sort({ order: 1 });
    
    const tasksWithStatus = tasks.map(task => ({
      ...task.toObject(),
      completed: user ? user.completedTasks.includes(task._id) : false
    }));
    
    res.json({ tasks: tasksWithStatus });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete a task
router.post('/:taskId/complete', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findOne({ telegramId: req.telegramId });
    const task = await Task.findById(taskId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (user.completedTasks.includes(task._id)) {
      return res.status(400).json({ error: 'Task already completed' });
    }
    
    // Add reward
    user.points += task.reward;
    user.totalEarned += task.reward;
    user.completedTasks.push(task._id);
    user.pointsHistory.push({
      amount: task.reward,
      type: 'task',
      description: task.title
    });
    
    await user.save();
    
    res.json({ 
      success: true, 
      reward: task.reward,
      newBalance: user.points,
      message: `You earned ${task.reward} points!`
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create task
router.post('/admin/create', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize default tasks
router.post('/admin/init', async (req, res) => {
  try {
    const defaultTasks = [
      {
        title: 'Follow us on Twitter',
        titleAr: 'تابعنا على تويتر',
        description: 'Follow our official Twitter account',
        descriptionAr: 'تابع حسابنا الرسمي على تويتر',
        reward: 200,
        type: 'social',
        icon: 'twitter',
        link: 'https://twitter.com/ubash',
        actionType: 'follow',
        order: 1
      },
      {
        title: 'Join Telegram Channel',
        titleAr: 'انضم لقناة تلجرام',
        description: 'Join our official Telegram announcement channel',
        descriptionAr: 'انضم لقناتنا الرسمية للإعلانات',
        reward: 300,
        type: 'telegram',
        icon: 'telegram',
        link: 'https://t.me/ubash_channel',
        actionType: 'join',
        order: 2
      },
      {
        title: 'Join Telegram Group',
        titleAr: 'انضم لمجموعة تلجرام',
        description: 'Join our community group',
        descriptionAr: 'انضم لمجموعة المجتمع',
        reward: 250,
        type: 'telegram',
        icon: 'users',
        link: 'https://t.me/ubash_community',
        actionType: 'join',
        order: 3
      },
      {
        title: 'Subscribe on YouTube',
        titleAr: 'اشترك على يوتيوب',
        description: 'Subscribe to our YouTube channel',
        descriptionAr: 'اشترك في قناتنا على يوتيوب',
        reward: 250,
        type: 'social',
        icon: 'youtube',
        link: 'https://youtube.com/@ubash',
        actionType: 'subscribe',
        order: 4
      },
      {
        title: 'Follow on Instagram',
        titleAr: 'تابعنا على انستجرام',
        description: 'Follow our Instagram page',
        descriptionAr: 'تابع صفحتنا على انستجرام',
        reward: 200,
        type: 'social',
        icon: 'instagram',
        link: 'https://instagram.com/ubash',
        actionType: 'follow',
        order: 5
      },
      {
        title: 'Invite 3 Friends',
        titleAr: 'ادعو 3 أصدقاء',
        description: 'Invite at least 3 friends to join Ubash',
        descriptionAr: 'ادعو على الأقل 3 أصدقاء للانضمام',
        reward: 1000,
        type: 'special',
        icon: 'gift',
        actionType: 'verify',
        order: 6
      }
    ];
    
    for (const taskData of defaultTasks) {
      await Task.findOneAndUpdate(
        { title: taskData.title },
        taskData,
        { upsert: true, new: true }
      );
    }
    
    res.json({ message: 'Default tasks initialized', count: defaultTasks.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
