const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleAr: { type: String, default: '' },
  description: { type: String, default: '' },
  descriptionAr: { type: String, default: '' },
  reward: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['social', 'telegram', 'daily', 'special', 'partner'],
    default: 'social'
  },
  icon: { type: String, default: 'star' },
  link: { type: String, default: '' },
  actionType: {
    type: String,
    enum: ['visit', 'join', 'follow', 'subscribe', 'share', 'verify'],
    default: 'visit'
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
