import { config } from "./config";
import { createBot } from "./bot";

if (!config.token) {
  console.log(
    `[telegram-bot] ${config.appName}: set TELEGRAM_BOT_TOKEN to start the bot.`,
  );
  process.exit(0);
}

const bot = createBot(config.token);

await bot.api.setMyCommands([
  { command: "start", description: "Home — chats & projects" },
  { command: "new", description: "Create a new project" },
  { command: "sessions", description: "Browse your chats" },
  { command: "projects", description: "Browse your projects" },
  { command: "demo", description: "Try a sample AI build reply" },
  { command: "status", description: "Check bot status" },
  { command: "help", description: "How to use MrOS" },
  { command: "cancel", description: "Cancel and go home" },
]);

try {
  await bot.api.setMyDescription(
    "MrOS — vibe coding in Telegram. Chat to build apps, manage projects, and preview AI replies.",
  );
  await bot.api.setMyShortDescription("Build apps by chatting with MrOS.");
} catch {
  /* older Bot API / permissions — ignore */
}

bot.start({
  onStart: (info) => {
    console.log(
      `[telegram-bot] ${config.appName} @${info.username} online (demo UI)`,
    );
  },
});
