import { Bot } from "grammy";
import { OpenCodeService } from "./opencode.js";
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '../.env') });
const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedUser = process.env.TELEGRAM_ALLOWED_USER_ID;
if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is missing in .env");
    process.exit(1);
}
const bot = new Bot(token);
const agent = new OpenCodeService();
bot.on("message:text", async (ctx) => {
    const userId = ctx.from.id.toString();
    // Basic security check: if ALLOWED_USER is set, only that user can talk to the bot
    if (allowedUser && userId !== allowedUser) {
        await ctx.reply("Acceso denegado. Este asistente no te pertenece.");
        return;
    }
    // If ALLOWED_USER is not set, print it so the user can configure it
    if (!allowedUser) {
        console.log(`[BOT] First user detected ID: ${userId}. Update your .env with TELEGRAM_ALLOWED_USER_ID=${userId}`);
    }
    const statusMsg = await ctx.reply("🌀 Consultando a OpenCode...");
    let responseText = "";
    try {
        const finalResponse = await agent.sendMessage(ctx.message.text, async (chunk) => {
            // Telegram editing is rate-limited, so we don't update on every chunk
            // In a real scenario, we might buffer or throttle updates
        });
        await ctx.api.editMessageText(ctx.chat.id, statusMsg.message_id, finalResponse || "No hubo respuesta del agente.");
    }
    catch (error) {
        await ctx.api.editMessageText(ctx.chat.id, statusMsg.message_id, "❌ Error al contactar con el agente.");
        console.error(error);
    }
});
bot.start();
console.log("Telegram Bot started. Polling for messages...");
