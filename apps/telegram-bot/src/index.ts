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
  { command: "start", description: "Welcome + sessions" },
  { command: "new", description: "Create a project (UUID)" },
  { command: "sessions", description: "List sessions" },
  { command: "projects", description: "List projects" },
  { command: "demo", description: "Stream a demo AI reply" },
  { command: "status", description: "Bot / platform status" },
  { command: "help", description: "How to use the bot" },
]);

bot.start({
  onStart: (info) => {
    console.log(
      `[telegram-bot] ${config.appName} @${info.username} online (demo UI)`,
    );
  },
});
