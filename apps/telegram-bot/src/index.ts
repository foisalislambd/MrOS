import { Bot } from "grammy";
import { APP_NAME } from "@mros/shared";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.log(
    `[telegram-bot] ${APP_NAME}: set TELEGRAM_BOT_TOKEN to start the bot.`,
  );
  process.exit(0);
}

const bot = new Bot(token);

bot.command("start", (ctx) =>
  ctx.reply(`${APP_NAME} online. Use /status to check the platform.`),
);

bot.command("status", (ctx) =>
  ctx.reply(`${APP_NAME} telegram control channel is ready.`),
);

bot.start();
console.log(`[telegram-bot] ${APP_NAME} bot started`);
