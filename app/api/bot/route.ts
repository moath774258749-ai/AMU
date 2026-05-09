import { NextRequest, NextResponse } from "next/server";
import { sql, generateReferralCode } from "@/lib/db";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const WEBAPP_URL = process.env.WEBAPP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
  };
}

async function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    if (!update.message?.text) {
      return NextResponse.json({ ok: true });
    }

    const { message } = update;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text;
    const username = message.from.username;
    const firstName = message.from.first_name;
    const lastName = message.from.last_name;

    // Handle /start command
    if (text.startsWith("/start")) {
      // Check for referral code
      const parts = text.split(" ");
      const referralCode = parts.length > 1 ? parts[1] : null;

      // Check if user exists
      const existingUsers = await sql`
        SELECT * FROM ubash_users WHERE telegram_id = ${userId}
      `;

      if (existingUsers.length === 0) {
        // Create new user
        const newReferralCode = generateReferralCode();
        
        let referredById = null;
        if (referralCode) {
          const referrer = await sql`
            SELECT id FROM ubash_users WHERE referral_code = ${referralCode}
          `;
          if (referrer.length > 0) {
            referredById = referrer[0].id;
          }
        }

        const newUser = await sql`
          INSERT INTO ubash_users (telegram_id, username, first_name, last_name, referral_code, referred_by, points)
          VALUES (${userId}, ${username || null}, ${firstName || null}, ${lastName || null}, ${newReferralCode}, ${referredById}, ${referredById ? 100 : 0})
          RETURNING *
        `;

        // If referred, give bonus to referrer
        if (referredById) {
          await sql`
            UPDATE ubash_users SET points = points + 200 WHERE id = ${referredById}
          `;
          
          await sql`
            INSERT INTO ubash_transactions (user_id, amount, type, description, description_ar)
            VALUES (${newUser[0].id}, 100, 'referral_bonus', 'Welcome bonus', 'مكافأة الترحيب')
          `;
          
          await sql`
            INSERT INTO ubash_transactions (user_id, amount, type, description, description_ar)
            VALUES (${referredById}, 200, 'referral_reward', 'Referral reward', 'مكافأة الإحالة')
          `;
        }
      }

      // Send welcome message with Web App button
      const welcomeText = `🚀 <b>Welcome to Ubash!</b>

مرحباً بك في Ubash!

Earn points by completing tasks, claiming daily rewards, and inviting friends!

اربح النقاط من خلال إكمال المهام والحصول على المكافآت اليومية ودعوة الأصدقاء!

Click the button below to open the app:
انقر على الزر أدناه لفتح التطبيق:`;

      await sendMessage(chatId, welcomeText, {
        inline_keyboard: [
          [
            {
              text: "🎮 Open Ubash | افتح Ubash",
              web_app: { url: WEBAPP_URL },
            },
          ],
        ],
      });

      return NextResponse.json({ ok: true });
    }

    // Handle /points command
    if (text === "/points" || text === "/balance") {
      const users = await sql`
        SELECT * FROM ubash_users WHERE telegram_id = ${userId}
      `;

      if (users.length === 0) {
        await sendMessage(chatId, "Please use /start first to create your account.\nالرجاء استخدام /start أولاً لإنشاء حسابك.");
      } else {
        const user = users[0];
        await sendMessage(
          chatId,
          `💰 <b>Your Balance | رصيدك</b>\n\n${user.points.toLocaleString()} UB Points\n\n🔥 Daily Streak: ${user.daily_streak} days\n🔥 السلسلة اليومية: ${user.daily_streak} أيام`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Handle /referral command
    if (text === "/referral" || text === "/invite") {
      const users = await sql`
        SELECT * FROM ubash_users WHERE telegram_id = ${userId}
      `;

      if (users.length === 0) {
        await sendMessage(chatId, "Please use /start first.\nالرجاء استخدام /start أولاً.");
      } else {
        const user = users[0];
        const botUsername = process.env.BOT_USERNAME || "UbashBot";
        const referralLink = `https://t.me/${botUsername}?start=${user.referral_code}`;

        await sendMessage(
          chatId,
          `🔗 <b>Your Referral Link | رابط الإحالة</b>\n\n${referralLink}\n\nShare this link and earn 200 points for each friend!\nشارك هذا الرابط واربح 200 نقطة لكل صديق!`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (text === "/help") {
      await sendMessage(
        chatId,
        `📚 <b>Commands | الأوامر</b>

/start - Start the bot | بدء البوت
/points - Check your balance | تحقق من رصيدك
/referral - Get referral link | احصل على رابط الإحالة
/help - Show this message | عرض هذه الرسالة

Open the Web App to:
- Complete tasks | إكمال المهام
- Claim daily rewards | الحصول على المكافآت اليومية
- View leaderboard | عرض المتصدرين
- Manage your profile | إدارة ملفك الشخصي`
      );

      return NextResponse.json({ ok: true });
    }

    // Default response
    await sendMessage(chatId, "Use /start to open Ubash!\nاستخدم /start لفتح Ubash!", {
      inline_keyboard: [
        [
          {
            text: "🎮 Open Ubash | افتح Ubash",
            web_app: { url: WEBAPP_URL },
          },
        ],
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bot webhook error:", error);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Bot webhook is active" });
}
