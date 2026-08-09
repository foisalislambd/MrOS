import type { Api, Context } from "grammy";
import type {
  InlineKeyboardMarkup,
  InputRichMessage,
  InputRichMessageWithoutUpload,
  ReplyKeyboardMarkup,
} from "grammy/types";
import { config } from "../config";

export type RichSendOptions = {
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup;
  reply_to_message_id?: number;
  message_effect_id?: string;
};

function draftId(): number {
  // Non-zero 32-bit-ish id; same id animates updates for one stream.
  return (Date.now() % 2_000_000_000) + 1;
}

export async function sendRich(
  api: Api,
  chatId: number | string,
  rich_message: InputRichMessage,
  options?: RichSendOptions,
) {
  try {
    return await api.sendRichMessage(chatId, rich_message, {
      reply_markup: options?.reply_markup,
      reply_parameters: options?.reply_to_message_id
        ? { message_id: options.reply_to_message_id }
        : undefined,
      message_effect_id: options?.message_effect_id,
    });
  } catch (err) {
    console.warn(`[${config.appName}] sendRichMessage failed, falling back to HTML`, err);
    const text = fallbackText(rich_message);
    return api.sendMessage(chatId, text, {
      parse_mode: "HTML",
      reply_markup: options?.reply_markup,
      reply_parameters: options?.reply_to_message_id
        ? { message_id: options.reply_to_message_id }
        : undefined,
    });
  }
}

export async function sendRichMarkdown(
  ctx: Context,
  markdown: string,
  options?: RichSendOptions,
) {
  const chatId = ctx.chat?.id;
  if (chatId == null) throw new Error("No chat");
  return sendRich(ctx.api, chatId, { markdown }, options);
}

export async function sendRichHtml(
  ctx: Context,
  html: string,
  options?: RichSendOptions,
) {
  const chatId = ctx.chat?.id;
  if (chatId == null) throw new Error("No chat");
  return sendRich(ctx.api, chatId, { html }, options);
}

export type DraftStep = {
  markdown?: string;
  html?: string;
};

/**
 * Streams ephemeral rich drafts (thinking → tools → body), then persists final message.
 * Drafts only work in private chats; elsewhere we skip drafts and send final only.
 */
export async function streamAgentReply(
  ctx: Context,
  steps: DraftStep[],
  final: InputRichMessage,
  options?: RichSendOptions & { delayMs?: number },
) {
  const chatId = ctx.chat?.id;
  if (chatId == null) throw new Error("No chat");

  const delay = options?.delayMs ?? 450;
  const isPrivate = ctx.chat?.type === "private";
  const id = draftId();

  if (isPrivate) {
    for (const step of steps) {
      const rich_message = (
        step.html ? { html: step.html } : { markdown: step.markdown ?? "" }
      ) as InputRichMessageWithoutUpload;
      try {
        await ctx.api.sendRichMessageDraft(chatId, id, rich_message);
      } catch (err) {
        console.warn(`[${config.appName}] sendRichMessageDraft failed`, err);
        break;
      }
      await sleep(delay);
    }
  }

  return sendRich(ctx.api, chatId, final, options);
}

function fallbackText(rich: InputRichMessage): string {
  if ("html" in rich && rich.html) {
    return stripToBasicHtml(rich.html);
  }
  if ("markdown" in rich && rich.markdown) {
    return escapeHtml(rich.markdown).slice(0, 3900);
  }
  return `<b>${config.appName}</b>\nRich message (demo).`;
}

function stripToBasicHtml(html: string) {
  return html
    .replace(/<\/?(tg-thinking)[^>]*>/gi, "")
    .replace(/<\/?details[^>]*>/gi, "")
    .replace(/<\/?summary[^>]*>/gi, "")
    .replace(/<\/?table[^>]*>/gi, "")
    .replace(/<\/?thead[^>]*>/gi, "")
    .replace(/<\/?tbody[^>]*>/gi, "")
    .replace(/<\/?tr[^>]*>/gi, "\n")
    .replace(/<\/?t[hd][^>]*>/gi, " · ")
    .replace(/<\/?h[1-6][^>]*>/gi, (m) => (m.startsWith("</") ? "\n" : "\n<b>"))
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, 3900);
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
