import { NextRequest, NextResponse } from "next/server";
import { sql, generateReferralCode } from "@/lib/db";

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

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegram_id, username, first_name, last_name, photo_url, referral_code } = body;

    if (!telegram_id) {
      return NextResponse.json({ error: "telegram_id is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT * FROM ubash_users WHERE telegram_id = ${telegram_id}
    `;

    if (existingUsers.length > 0) {
      // Update existing user
      const updated = await sql`
        UPDATE ubash_users 
        SET username = ${username || null}, 
            first_name = ${first_name || null}, 
            last_name = ${last_name || null},
            photo_url = ${photo_url || null},
            updated_at = NOW()
        WHERE telegram_id = ${telegram_id}
        RETURNING *
      `;
      return NextResponse.json(updated[0]);
    }

    // Create new user
    const newReferralCode = generateReferralCode();
    
    // Check for referral
    let referredById = null;
    if (referral_code) {
      const referrer = await sql`
        SELECT id FROM ubash_users WHERE referral_code = ${referral_code}
      `;
      if (referrer.length > 0) {
        referredById = referrer[0].id;
      }
    }

    const newUser = await sql`
      INSERT INTO ubash_users (telegram_id, username, first_name, last_name, photo_url, referral_code, referred_by, points)
      VALUES (${telegram_id}, ${username || null}, ${first_name || null}, ${last_name || null}, ${photo_url || null}, ${newReferralCode}, ${referredById}, ${referredById ? 100 : 0})
      RETURNING *
    `;

    // If referred, give bonus to referrer
    if (referredById) {
      await sql`
        UPDATE ubash_users SET points = points + 200 WHERE id = ${referredById}
      `;
      
      // Log transactions
      await sql`
        INSERT INTO ubash_transactions (user_id, amount, type, description, description_ar)
        VALUES (${newUser[0].id}, 100, 'referral_bonus', 'Welcome bonus for joining via referral', 'مكافأة الترحيب للانضمام عبر الإحالة')
      `;
      
      await sql`
        INSERT INTO ubash_transactions (user_id, amount, type, description, description_ar)
        VALUES (${referredById}, 200, 'referral_reward', 'Reward for inviting a friend', 'مكافأة دعوة صديق')
      `;
    }

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
