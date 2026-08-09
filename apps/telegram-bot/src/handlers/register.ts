import type { Bot, Context } from "grammy";
import {
  askProjectName,
  createProjectInstant,
  handlePrompt,
  handleReplyButton,
  isReplyButton,
  openProject,
  openSession,
  promptCreateProject,
  runDemo,
  runIdea,
  showComposeHint,
  showHelp,
  showHome,
  showNewChatIdeas,
  showProjects,
  showSessions,
  showStatus,
} from "./actions";
import {
  attachProjectToSession,
  clearAwaitingProjectName,
  getProject,
  getUser,
  setActiveSession,
} from "../demo/store";
import { projectCreatedMarkdown } from "../format/messages";
import { fromStartPayload, toStartPayload } from "../format/safe";
import { sessionActionsKeyboard } from "../keyboards/inline";
import { sendRichMarkdown } from "../rich/send";

async function ack(ctx: Context, text?: string) {
  if (!ctx.callbackQuery) return;
  await ctx.answerCallbackQuery(text ? { text } : undefined).catch(() => undefined);
}

export function registerHandlers(bot: Bot<Context>) {
  bot.command("start", async (ctx) => {
    const payload = ctx.match?.trim();
    const sessionId = payload ? fromStartPayload(payload) : null;
    if (sessionId) {
      await openSession(ctx, sessionId);
      return;
    }
    await showHome(ctx);
  });

  bot.command("help", async (ctx) => {
    await showHelp(ctx);
  });

  bot.command("status", async (ctx) => {
    await showStatus(ctx);
  });

  bot.command("sessions", async (ctx) => {
    await showSessions(ctx, 0);
  });

  bot.command("projects", async (ctx) => {
    await showProjects(ctx);
  });

  bot.command("new", async (ctx) => {
    const name = ctx.match?.trim();
    if (name) await createProjectInstant(ctx, name);
    else await promptCreateProject(ctx);
  });

  bot.command("demo", async (ctx) => {
    await runDemo(ctx);
  });

  bot.command("cancel", async (ctx) => {
    if (!ctx.from) return;
    clearAwaitingProjectName(ctx.from.id);
    await showHome(ctx);
  });

  bot.on("callback_query:data", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "Please open this in a private chat.", show_alert: true });
      return;
    }

    const data = ctx.callbackQuery.data;

    if (data === "home") {
      await ack(ctx);
      await showHome(ctx);
      return;
    }
    if (data === "projects:list") {
      await ack(ctx);
      await showProjects(ctx);
      return;
    }
    if (data === "project:create") {
      await ack(ctx);
      await promptCreateProject(ctx);
      return;
    }
    if (data === "project:create:instant") {
      await ack(ctx, "Creating…");
      await createProjectInstant(ctx);
      return;
    }
    if (data === "project:create:named") {
      await ack(ctx);
      await askProjectName(ctx);
      return;
    }
    if (data === "demo:agent") {
      await ack(ctx, "Running demo…");
      await runDemo(ctx);
      return;
    }
    if (data === "status") {
      await ack(ctx);
      await showStatus(ctx);
      return;
    }
    if (data === "help") {
      await ack(ctx);
      await showHelp(ctx);
      return;
    }
    if (data === "chat:new") {
      await ack(ctx);
      await showNewChatIdeas(ctx);
      return;
    }
    if (data === "chat:compose") {
      await ack(ctx);
      await showComposeHint(ctx);
      return;
    }

    const ideaMatch = /^idea:([a-z]+)$/.exec(data);
    if (ideaMatch) {
      await ack(ctx, "Starting…");
      await runIdea(ctx, ideaMatch[1]!);
      return;
    }

    const pageMatch = /^sessions:page:(\d+)$/.exec(data);
    if (pageMatch) {
      await ack(ctx);
      await showSessions(ctx, Number(pageMatch[1]));
      return;
    }

    const demoProject = /^demo:agent:project:(.+)$/.exec(data);
    if (demoProject) {
      const projectId = demoProject[1]!;
      const session = getUser(ctx.from.id).sessions.find(
        (s) => s.projectId === projectId,
      );
      await ack(ctx, "Running demo…");
      if (session) await runDemo(ctx, session.id);
      else if (getProject(ctx.from.id, projectId)) await runDemo(ctx);
      return;
    }

    const demoSession = /^demo:agent:(.+)$/.exec(data);
    if (demoSession) {
      await ack(ctx, "Running demo…");
      await runDemo(ctx, demoSession[1]);
      return;
    }

    const sessionChat = /^session:chat:(.+)$/.exec(data);
    if (sessionChat) {
      await ack(ctx);
      setActiveSession(ctx.from.id, sessionChat[1]!);
      await openSession(ctx, sessionChat[1]!);
      return;
    }

    const projectSession = /^project:session:(.+)$/.exec(data);
    if (projectSession) {
      const session = getUser(ctx.from.id).sessions.find(
        (s) => s.projectId === projectSession[1],
      );
      await ack(ctx);
      if (session) await openSession(ctx, session.id);
      else await ctx.reply("This project doesn’t have a chat yet. Create one from Home.");
      return;
    }

    const fromSession = /^project:from_session:(.+)$/.exec(data);
    if (fromSession) {
      const attached = attachProjectToSession(ctx.from.id, fromSession[1]!);
      await ack(ctx, attached ? "Saved as project" : "Not found");
      if (!attached) {
        await ctx.reply("Couldn’t find that chat.");
        return;
      }
      await sendRichMarkdown(
        ctx,
        projectCreatedMarkdown(attached.project, attached.session),
        { reply_markup: sessionActionsKeyboard(attached.session) },
      );
      return;
    }

    const projectOpen = /^project:open:(.+)$/.exec(data);
    if (projectOpen) {
      await ack(ctx);
      await openProject(ctx, projectOpen[1]!);
      return;
    }

    const sessionMatch = /^session:(.+)$/.exec(data);
    if (sessionMatch) {
      await ack(ctx);
      await openSession(ctx, sessionMatch[1]!);
      return;
    }

    await ack(ctx, "Unknown action");
    await showHome(ctx);
  });

  bot.on("inline_query", async (ctx) => {
    const q = ctx.inlineQuery.query.trim().toLowerCase();
    const user = getUser(ctx.from.id);
    const sessions = user.sessions.filter(
      (s) => !q || s.title.toLowerCase().includes(q) || s.id.includes(q),
    );

    const username = ctx.me.username;
    const results = sessions.slice(0, 20).map((s, i) => ({
      type: "article" as const,
      id: (s.id || `s-${i}`).slice(0, 64),
      title: s.title.slice(0, 64),
      description: s.projectId
        ? `Project · ${s.messages.length} messages`
        : `Chat · ${s.messages.length} messages`,
      input_message_content: {
        rich_message: {
          markdown: `**${s.title.replace(/[`*|_]/g, "")}**\n\nOpen in ${username ? `@${username}` : "MrOS"} to continue this chat.`,
        },
      },
      reply_markup: username
        ? {
            inline_keyboard: [
              [
                {
                  text: "Open chat",
                  url: `https://t.me/${username}?start=${toStartPayload(s.id)}`,
                },
              ],
            ],
          }
        : undefined,
    }));

    await ctx.answerInlineQuery(results, {
      cache_time: 5,
      is_personal: true,
      ...(sessions.length
        ? {}
        : { button: { text: "Open MrOS", start_parameter: "inline" } }),
    });
  });

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith("/")) return;

    if (isReplyButton(text)) {
      await handleReplyButton(ctx, text);
      return;
    }

    await handlePrompt(ctx, text);
  });
}
