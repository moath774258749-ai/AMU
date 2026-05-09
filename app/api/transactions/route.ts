import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get("telegram_id");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    if (!telegramId) {
      return NextResponse.json({ error: "telegram_id is required" }, { status: 400 });
    }

    // Get user
    const users = await sql`
      SELECT id FROM ubash_users WHERE telegram_id = ${parseInt(telegramId)}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    // Get transactions
    const transactions = await sql`
      SELECT * FROM ubash_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM ubash_transactions WHERE user_id = ${userId}
    `;

    return NextResponse.json({
      transactions,
      total: parseInt(String(countResult[0].total)),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
