import type { Context } from "grammy";
import {
  createSessionFromPrompt,
  getSession,
  getUser,
  listSessionsGrouped,
  setActiveSession,
  appendMessage,
  getProject,
  updateProjectStatus,
  createProject,
  clearAwaitingProjectName,
} from "../demo/store";
import {
  helpMarkdown,
  projectCreatedMarkdown,
  projectDetailMarkdown,
  projectsListMarkdown,
  sessionDetailMarkdown,
  sessionsListMarkdown,
  statusMarkdown,
  welcomeMarkdown,
} from "../format/messages";
import {
  createProjectConfirmKeyboard,
  homeInlineKeyboard,
  projectActionsKeyboard,
  projectsInlineKeyboard,
  sessionActionsKeyboard,
  sessionsInlineKeyboard,
} from "../keyboards/inline";
import { BTN } from "../keyboards/reply";
import { runDemoAgentReply } from "../rich/agent-demo";
import { sendRichMarkdown } from "../rich/send";

function uid(ctx: Context) {
  const id = ctx.from?.id;
  if (id == null) throw new Error("No user");
  return id;
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function showHome(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  const user = getUser(uid(ctx));
  const name = ctx.from?.first_name;
  await sendRichMarkdown(
    ctx,
    welcomeMarkdown({
      name,
      sessionCount: user.sessions.length,
      projectCount: user.projects.length,
      sessions: listSessionsGrouped(uid(ctx)),
    }),
    {
      reply_markup: sessionsInlineKeyboard(user.sessions, { page: 0 }),
    },
  );
}

export async function showSessions(ctx: Context, page = 0, edit = false) {
  clearAwaitingProjectName(uid(ctx));
  const user = getUser(uid(ctx));
  const md = sessionsListMarkdown(listSessionsGrouped(uid(ctx)));
  const markup = sessionsInlineKeyboard(user.sessions, { page });

  if (edit && ctx.callbackQuery?.message && ctx.chat) {
    try {
      await ctx.api.editMessageText(
        ctx.chat.id,
        ctx.callbackQuery.message.message_id,
        { markdown: md },
        { reply_markup: markup },
      );
      return;
    } catch {
      /* fall through to send a fresh message */
    }
  }

  await sendRichMarkdown(ctx, md, { reply_markup: markup });
}

export async function showProjects(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  const user = getUser(uid(ctx));
  await sendRichMarkdown(ctx, projectsListMarkdown(user.projects), {
    reply_markup: projectsInlineKeyboard(user.projects),
  });
}

export async function showStatus(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  const user = getUser(uid(ctx));
  const active = user.activeSessionId
    ? user.sessions.find((s) => s.id === user.activeSessionId)
    : undefined;
  await sendRichMarkdown(
    ctx,
    statusMarkdown({
      sessionCount: user.sessions.length,
      projectCount: user.projects.length,
      activeTitle: active?.title,
    }),
    { reply_markup: homeInlineKeyboard() },
  );
}

export async function showHelp(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  await sendRichMarkdown(ctx, helpMarkdown(), {
    reply_markup: homeInlineKeyboard(),
  });
}

export async function openSession(ctx: Context, sessionId: string) {
  clearAwaitingProjectName(uid(ctx));
  const session = getSession(uid(ctx), sessionId);
  if (!session) {
    await ctx.reply("Session not found.");
    return;
  }
  setActiveSession(uid(ctx), session.id);
  await sendRichMarkdown(ctx, sessionDetailMarkdown(session), {
    reply_markup: sessionActionsKeyboard(session),
  });
}

export async function openProject(ctx: Context, projectId: string) {
  clearAwaitingProjectName(uid(ctx));
  const project = getProject(uid(ctx), projectId);
  if (!project) {
    await ctx.reply("Project not found.");
    return;
  }
  await sendRichMarkdown(ctx, projectDetailMarkdown(project), {
    reply_markup: projectActionsKeyboard(project),
  });
}

export async function promptCreateProject(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  await sendRichMarkdown(
    ctx,
    `# New project\n\nCreate instantly with a **UUID**, or name it first.`,
    { reply_markup: createProjectConfirmKeyboard() },
  );
}

export async function createProjectInstant(ctx: Context, name?: string) {
  const { project, session } = createProject(uid(ctx), name);
  await sendRichMarkdown(ctx, projectCreatedMarkdown(project, session), {
    reply_markup: sessionActionsKeyboard(session),
  });
}

export async function askProjectName(ctx: Context) {
  const user = getUser(uid(ctx));
  user.awaitingProjectName = true;
  await ctx.reply(
    "Send a project name (or /cancel). A UUID will be assigned automatically.",
  );
}

export async function handlePrompt(ctx: Context, text: string) {
  const user = getUser(uid(ctx));
  const prompt = text.trim();
  if (!prompt) return;

  if (user.awaitingProjectName) {
    await createProjectInstant(ctx, prompt);
    return;
  }

  let session = user.activeSessionId
    ? getSession(uid(ctx), user.activeSessionId)
    : undefined;

  if (!session) {
    session = createSessionFromPrompt(uid(ctx), prompt);
  } else {
    appendMessage(uid(ctx), session.id, {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
    });
  }

  if (session.projectId) {
    updateProjectStatus(uid(ctx), session.projectId, "building");
  }

  await ctx.reply(`Working in <b>${escapeHtml(session.title)}</b>…`, {
    parse_mode: "HTML",
  });

  try {
    await runDemoAgentReply(ctx, { prompt, session });
    appendMessage(uid(ctx), session.id, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Demo agent reply completed (see rich message above).",
      createdAt: new Date().toISOString(),
      files: ["src/App.tsx", "src/components/Hero.tsx"],
    });
    if (session.projectId) {
      updateProjectStatus(uid(ctx), session.projectId, "ready");
    }
  } catch (err) {
    if (session.projectId) {
      updateProjectStatus(uid(ctx), session.projectId, "failed");
    }
    throw err;
  }
}

export async function runDemo(ctx: Context, sessionId?: string) {
  clearAwaitingProjectName(uid(ctx));
  const user = getUser(uid(ctx));
  const session = sessionId
    ? getSession(uid(ctx), sessionId)
    : user.activeSessionId
      ? getSession(uid(ctx), user.activeSessionId)
      : user.sessions[0];

  const prompt =
    session?.messages.find((m) => m.role === "user")?.content ??
    "Build a calm landing page for MrOS with a strong brand mark and one CTA.";

  if (session) {
    setActiveSession(uid(ctx), session.id);

    const hasUserMessage = session.messages.some((m) => m.role === "user");
    if (!hasUserMessage) {
      appendMessage(uid(ctx), session.id, {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        createdAt: new Date().toISOString(),
      });
    }

    if (session.projectId) {
      updateProjectStatus(uid(ctx), session.projectId, "building");
    }
  }

  try {
    await runDemoAgentReply(ctx, { prompt, session });
    if (session) {
      appendMessage(uid(ctx), session.id, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Demo agent reply completed (see rich message above).",
        createdAt: new Date().toISOString(),
        files: ["src/App.tsx", "src/components/Hero.tsx"],
      });
      if (session.projectId) {
        updateProjectStatus(uid(ctx), session.projectId, "ready");
      }
    }
  } catch (err) {
    if (session?.projectId) {
      updateProjectStatus(uid(ctx), session.projectId, "failed");
    }
    throw err;
  }
}

export function isReplyButton(text: string) {
  return (Object.values(BTN) as string[]).includes(text);
}

export async function handleReplyButton(ctx: Context, text: string) {
  switch (text) {
    case BTN.newProject:
      return promptCreateProject(ctx);
    case BTN.sessions:
      return showSessions(ctx, 0);
    case BTN.projects:
      return showProjects(ctx);
    case BTN.status:
      return showStatus(ctx);
    case BTN.help:
      return showHelp(ctx);
    case BTN.demoAgent:
      return runDemo(ctx);
    default:
      return;
  }
}
