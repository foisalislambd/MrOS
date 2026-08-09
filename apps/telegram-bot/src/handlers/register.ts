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
  showHelp,
  showHome,
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

export function registerHandlers(bot: Bot<Context>) {
  bot.command("start", async (ctx) => {
    const payload = ctx.match?.trim();
    const sessionId = payload ? fromStartPayload(payload) : null;
    if (sessionId) {
      await showHome(ctx);
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
    await ctx.reply("Cancelled.");
  });

  bot.on("callback_query:data", async (ctx) => {
    if (!ctx.from) {
      await ctx.answerCallbackQuery({ text: "User required", show_alert: true });
      return;
    }

    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery().catch(() => undefined);

    if (data === "home") {
      await showHome(ctx);
      return;
    }
    if (data === "projects:list") {
      await showProjects(ctx);
      return;
    }
    if (data === "project:create") {
      await promptCreateProject(ctx);
      return;
    }
    if (data === "project:create:instant") {
      await createProjectInstant(ctx);
      return;
    }
    if (data === "project:create:named") {
      await askProjectName(ctx);
      return;
    }
    if (data === "demo:agent") {
      await runDemo(ctx);
      return;
    }

    const pageMatch = /^sessions:page:(\d+)$/.exec(data);
    if (pageMatch) {
      await showSessions(ctx, Number(pageMatch[1]), true);
      return;
    }

    // More specific patterns first
    const demoProject = /^demo:agent:project:(.+)$/.exec(data);
    if (demoProject) {
      const projectId = demoProject[1]!;
      const session = getUser(ctx.from.id).sessions.find(
        (s) => s.projectId === projectId,
      );
      if (session) await runDemo(ctx, session.id);
      else if (getProject(ctx.from.id, projectId)) await runDemo(ctx);
      return;
    }

    const demoSession = /^demo:agent:(.+)$/.exec(data);
    if (demoSession) {
      await runDemo(ctx, demoSession[1]);
      return;
    }

    const sessionChat = /^session:chat:(.+)$/.exec(data);
    if (sessionChat) {
      setActiveSession(ctx.from.id, sessionChat[1]!);
      await openSession(ctx, sessionChat[1]!);
      return;
    }

    const projectSession = /^project:session:(.+)$/.exec(data);
    if (projectSession) {
      const session = getUser(ctx.from.id).sessions.find(
        (s) => s.projectId === projectSession[1],
      );
      if (session) await openSession(ctx, session.id);
      else await ctx.reply("No session linked to this project yet.");
      return;
    }

    const fromSession = /^project:from_session:(.+)$/.exec(data);
    if (fromSession) {
      const attached = attachProjectToSession(ctx.from.id, fromSession[1]!);
      if (!attached) {
        await ctx.reply("Session not found.");
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
      await openProject(ctx, projectOpen[1]!);
      return;
    }

    const sessionMatch = /^session:(.+)$/.exec(data);
    if (sessionMatch) {
      await openSession(ctx, sessionMatch[1]!);
      return;
    }

    await ctx.reply("Unknown action.");
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
          markdown: `# ${s.title.replace(/[`*|_]/g, "")}\n\nSession \`${s.id}\` — open MrOS bot and pick it from **Sessions**.`,
        },
      },
      reply_markup: username
        ? {
            inline_keyboard: [
              [
                {
                  text: "Open in MrOS",
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
