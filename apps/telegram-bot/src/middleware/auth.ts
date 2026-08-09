import type { Context, NextFunction } from "grammy";
import { config } from "../config";

export async function authGuard(ctx: Context, next: NextFunction) {
  const allowed = config.allowedUserIds;
  if (!allowed) return next();

  const uid = ctx.from?.id;
  if (uid != null && allowed.has(uid)) return next();

  if (ctx.inlineQuery) {
    await ctx.answerInlineQuery([], {
      cache_time: 1,
      is_personal: true,
      button: { text: "Open MrOS", start_parameter: "auth" },
    });
    return;
  }

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery({
      text: "Not authorized for this bot.",
      show_alert: true,
    });
    return;
  }

  // message / channel_post / etc. — only reply when we have a chat
  if (ctx.chat) {
    await ctx.reply("You’re not on the allowlist for this MrOS bot.");
  }
}
