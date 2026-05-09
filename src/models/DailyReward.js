const mongoose = require('mongoose');

const dailyRewardSchema = new mongoose.Schema({
  day: { type: Number, required: true, unique: true },
  reward: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  isSpecial: { type: Boolean, default: false }
});

// Create default daily rewards (7 days)
dailyRewardSchema.statics.initializeDefaults = async function() {
  const defaults = [
    { day: 1, reward: 100, bonus: 0, isSpecial: false },
    { day: 2, reward: 150, bonus: 0, isSpecial: false },
    { day: 3, reward: 200, bonus: 0, isSpecial: false },
    { day: 4, reward: 300, bonus: 0, isSpecial: false },
    { day: 5, reward: 400, bonus: 0, isSpecial: false },
    { day: 6, reward: 500, bonus: 0, isSpecial: false },
    { day: 7, reward: 1000, bonus: 500, isSpecial: true }
  ];

  for (const item of defaults) {
    await this.findOneAndUpdate(
      { day: item.day },
      item,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('DailyReward', dailyRewardSchema);
