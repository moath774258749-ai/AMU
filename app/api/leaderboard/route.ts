import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get("telegram_id");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

    // Get top users
    const leaderboard = await sql`
      SELECT 
        id, telegram_id, username, first_name, last_name, photo_url, points, daily_streak,
        RANK() OVER (ORDER BY points DESC) as rank
      FROM ubash_users
      ORDER BY points DESC
      LIMIT ${limit}
    `;

    // Get user's rank if telegram_id provided
    let userRank = null;
    if (telegramId) {
      const userRankResult = await sql`
        SELECT rank FROM (
          SELECT telegram_id, RANK() OVER (ORDER BY points DESC) as rank
          FROM ubash_users
        ) ranked
        WHERE telegram_id = ${parseInt(telegramId)}
      `;
      
      if (userRankResult.length > 0) {
        userRank = userRankResult[0].rank;
      }
    }

    // Get total users count
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM ubash_users
    `;

    return NextResponse.json({
      leaderboard,
      user_rank: userRank,
      total_users: parseInt(String(totalResult[0].total)),
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
