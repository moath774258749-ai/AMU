const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("🚀 Welcome to Ubash", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚀 Open Ubash App",
            web_app: { url: process.env.WEBAPP_URL }
          }
        ]
      ]
    }
  });
});

module.exports = bot;