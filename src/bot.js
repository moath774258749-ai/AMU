const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  const startPayload = ctx.startPayload; // Referral code
  const webAppUrl = startPayload 
    ? `${process.env.WEBAPP_URL}?ref=${startPayload}`
    : process.env.WEBAPP_URL;
  
  const welcomeMessage = `
🚀 *Welcome to Ubash!*

Your gateway to the Web3 reward ecosystem.

✨ *What you can do:*
• Complete tasks and earn points
• Claim daily rewards
• Invite friends for bonus rewards
• Compete on the leaderboard

💎 Start earning now!
  `;
  
  ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚀 Open Ubash App",
            web_app: { url: webAppUrl }
          }
        ],
        [
          {
            text: "📢 Join Channel",
            url: "https://t.me/ubash_channel"
          },
          {
            text: "👥 Community",
            url: "https://t.me/ubash_community"
          }
        ]
      ]
    }
  });
});

bot.help((ctx) => {
  ctx.reply(`
📖 *Ubash Help*

🎯 *Commands:*
/start - Open the Ubash app
/help - Show this help message

💡 *How to earn points:*
1. Open the app and complete tasks
2. Claim daily rewards (come back every day!)
3. Invite friends using your referral link

Need help? Join our community group!
  `, { parse_mode: 'Markdown' });
});

module.exports = bot;
