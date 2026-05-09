import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "BOT_TOKEN not configured" }, { status: 500 });
  }

  // Get the base URL
  const host = request.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const webhookUrl = `${protocol}://${host}/api/bot`;

  try {
    // Set webhook
    const setWebhookRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
        }),
      }
    );

    const setWebhookData = await setWebhookRes.json();

    // Get webhook info
    const getWebhookRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    const webhookInfo = await getWebhookRes.json();

    // Get bot info
    const getMeRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getMe`
    );
    const botInfo = await getMeRes.json();

    return NextResponse.json({
      success: true,
      message: "Webhook configured successfully!",
      webhook_url: webhookUrl,
      set_webhook_result: setWebhookData,
      webhook_info: webhookInfo,
      bot_info: botInfo,
    });
  } catch (error) {
    console.error("Error setting up webhook:", error);
    return NextResponse.json({ error: "Failed to setup webhook" }, { status: 500 });
  }
}
