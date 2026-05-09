import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const DAILY_REWARDS = [10, 20, 30, 50, 75, 100, 150]; // Day 1-7 rewards

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get("telegram_id");

    if (!telegramId) {
      return NextResponse.json({ error: "telegram_id is required" }, { status: 400 });
    }

    const users = await sql`
      SELECT * FROM ubash_users WHERE telegram_id = ${parseInt(telegramId)}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    const lastClaim = user.last_daily_claim ? new Date(user.last_daily_claim) : null;
    const now = new Date();
    
    let canClaim = true;
    let hoursUntilNextClaim = 0;
    let currentStreak = user.daily_streak || 0;

    if (lastClaim) {
      const hoursSinceClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceClaim < 24) {
        canClaim = false;
        hoursUntilNextClaim = Math.ceil(24 - hoursSinceClaim);
      } else if (hoursSinceClaim > 48) {
        // Streak broken
        currentStreak = 0;
      }
    }

    const nextReward = DAILY_REWARDS[Math.min(currentStreak, DAILY_REWARDS.length - 1)];

    return NextResponse.json({
      can_claim: canClaim,
      current_streak: currentStreak,
      next_reward: nextReward,
      hours_until_next_claim: hoursUntilNextClaim,
      rewards_schedule: DAILY_REWARDS,
      last_claim: lastClaim,
    });
  } catch (error) {
    console.error("Error checking daily status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegram_id } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: "telegram_id is required" }, { status: 400 });
    }

    const users = await sql`
      SELECT * FROM ubash_users WHERE telegram_id = ${telegram_id}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    const lastClaim = user.last_daily_claim ? new Date(user.last_daily_claim) : null;
    const now = new Date();

    // Check if can claim
    if (lastClaim) {
      const hoursSinceClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceClaim < 24) {
        return NextResponse.json({ 
          error: "Daily reward already claimed",
          error_ar: "تم المطالبة بالمكافأة اليومية بالفعل",
          hours_until_next: Math.ceil(24 - hoursSinceClaim)
        }, { status: 400 });
      }
    }

    // Calculate new streak
    let newStreak = 1;
    if (lastClaim) {
      const hoursSinceClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
      if (hoursSinceClaim <= 48) {
        newStreak = (user.daily_streak || 0) + 1;
        if (newStreak > 7) newStreak = 7; // Cap at 7
      }
    }

    const reward = DAILY_REWARDS[Math.min(newStreak - 1, DAILY_REWARDS.length - 1)];

    // Update user
    await sql`
      UPDATE ubash_users 
      SET points = points + ${reward}, 
          daily_streak = ${newStreak}, 
          last_daily_claim = NOW(),
          updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Log transaction
    await sql`
      INSERT INTO ubash_transactions (user_id, amount, type, description, description_ar)
      VALUES (${user.id}, ${reward}, 'daily_reward', ${`Daily reward - Day ${newStreak}`}, ${`المكافأة اليومية - اليوم ${newStreak}`})
    `;

    // Get updated user
    const updatedUser = await sql`
      SELECT * FROM ubash_users WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: "Daily reward claimed!",
      message_ar: "تم الحصول على المكافأة اليومية!",
      reward,
      new_streak: newStreak,
      new_points: updatedUser[0].points,
    });
  } catch (error) {
    console.error("Error claiming daily reward:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
