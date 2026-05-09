import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get("telegram_id");

    if (!telegramId) {
      return NextResponse.json({ error: "telegram_id is required" }, { status: 400 });
    }

    // Get user
    const users = await sql`
      SELECT * FROM ubash_users WHERE telegram_id = ${parseInt(telegramId)}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Get referrals count
    const referrals = await sql`
      SELECT id, username, first_name, last_name, points, created_at
      FROM ubash_users 
      WHERE referred_by = ${user.id}
      ORDER BY created_at DESC
    `;

    // Calculate total earnings from referrals
    const earningsResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM ubash_transactions
      WHERE user_id = ${user.id} AND type = 'referral_reward'
    `;

    const botUsername = process.env.BOT_USERNAME || "UbashBot";
    const referralLink = `https://t.me/${botUsername}?start=${user.referral_code}`;

    return NextResponse.json({
      referral_code: user.referral_code,
      referral_link: referralLink,
      total_referrals: referrals.length,
      total_earnings: parseInt(String(earningsResult[0].total)) || 0,
      referrals: referrals,
    });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
