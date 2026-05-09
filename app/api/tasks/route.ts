import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get("telegram_id");

    // Get all active tasks
    const tasks = await sql`
      SELECT * FROM ubash_tasks WHERE is_active = true ORDER BY reward DESC
    `;

    // If user is provided, get their completed tasks
    let completedTaskIds: number[] = [];
    if (telegramId) {
      const user = await sql`
        SELECT id FROM ubash_users WHERE telegram_id = ${parseInt(telegramId)}
      `;
      
      if (user.length > 0) {
        const completions = await sql`
          SELECT task_id FROM ubash_task_completions WHERE user_id = ${user[0].id}
        `;
        completedTaskIds = completions.map((c: { task_id: number }) => c.task_id);
      }
    }

    const tasksWithStatus = tasks.map((task: { id: number }) => ({
      ...task,
      completed: completedTaskIds.includes(task.id),
    }));

    return NextResponse.json(tasksWithStatus);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegram_id, task_id } = body;

    if (!telegram_id || !task_id) {
      return NextResponse.json({ error: "telegram_id and task_id are required" }, { status: 400 });
    }

    // Get user
    const users = await sql`
      SELECT * FROM ubash_users WHERE telegram_id = ${telegram_id}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Get task
    const tasks = await sql`
      SELECT * FROM ubash_tasks WHERE id = ${task_id} AND is_active = true
    `;

    if (tasks.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = tasks[0];

    // Check if already completed
    const existing = await sql`
      SELECT * FROM ubash_task_completions WHERE user_id = ${user.id} AND task_id = ${task_id}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: "Task already completed", error_ar: "المهمة مكتملة بالفعل" }, { status: 400 });
    }

    // Complete task
    await sql`
      INSERT INTO ubash_task_completions (user_id, task_id)
      VALUES (${user.id}, ${task_id})
    `;

    // Award points
    await sql`
      UPDATE ubash_users SET points = points + ${task.reward}, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Log transaction
    await sql`
      INSERT INTO ubash_transactions (user_id, amount, type, description, description_ar)
      VALUES (${user.id}, ${task.reward}, 'task_reward', ${`Completed: ${task.title}`}, ${`أكملت: ${task.title_ar || task.title}`})
    `;

    // Get updated user
    const updatedUser = await sql`
      SELECT * FROM ubash_users WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: "Task completed successfully",
      message_ar: "تم إكمال المهمة بنجاح",
      reward: task.reward,
      new_points: updatedUser[0].points,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
