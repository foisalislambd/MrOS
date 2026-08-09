import { Bot, type Context } from "grammy";
import { config } from "./config";
import { registerHandlers } from "./handlers/register";
import { authGuard } from "./middleware/auth";

export function createBot(token: string) {
  const bot = new Bot<Context>(token);

  bot.use(authGuard);
  registerHandlers(bot);

  bot.catch((err) => {
    console.error(`[${config.appName}] bot error`, err.error);
  });

  return bot;
}
