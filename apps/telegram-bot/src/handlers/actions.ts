import type { Context } from "grammy";
import type { InlineKeyboardMarkup, InputRichMessage, ReplyKeyboardMarkup } from "grammy/types";
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
  composeHintMarkdown,
  helpMarkdown,
  IDEA_PROMPTS,
  newChatMarkdown,
  newProjectMarkdown,
  notFoundMarkdown,
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
  newChatIdeasKeyboard,
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

async function present(
  ctx: Context,
  markdown: string,
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup,
  opts?: { edit?: boolean },
) {
  const canEdit =
    opts?.edit !== false &&
    !!ctx.callbackQuery?.message &&
    !!ctx.chat &&
    // Only edit when markup is inline (reply keyboards can't edit onto old msgs usefully)
    !(reply_markup && "keyboard" in reply_markup);

  if (canEdit) {
    try {
      await ctx.api.editMessageText(
        ctx.chat!.id,
        ctx.callbackQuery!.message!.message_id,
        { markdown } satisfies InputRichMessage,
        { reply_markup: reply_markup as InlineKeyboardMarkup | undefined },
      );
      return;
    } catch {
      /* send fresh */
    }
  }

  await sendRichMarkdown(ctx, markdown, { reply_markup });
}

export async function showHome(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  const user = getUser(uid(ctx));
  const active = user.activeSessionId
    ? user.sessions.find((s) => s.id === user.activeSessionId)
    : undefined;

  await present(
    ctx,
    welcomeMarkdown({
      name: ctx.from?.first_name,
      sessionCount: user.sessions.length,
      projectCount: user.projects.length,
      activeTitle: active?.title,
      sessions: listSessionsGrouped(uid(ctx)),
    }),
    sessionsInlineKeyboard(user.sessions, {
      page: 0,
      activeId: user.activeSessionId,
    }),
  );
}

export async function showSessions(ctx: Context, page = 0) {
  clearAwaitingProjectName(uid(ctx));
  const user = getUser(uid(ctx));
  await present(
    ctx,
    sessionsListMarkdown(listSessionsGrouped(uid(ctx)), {
      activeId: user.activeSessionId,
    }),
    sessionsInlineKeyboard(user.sessions, {
      page,
      activeId: user.activeSessionId,
    }),
  );
}

export async function showProjects(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  const user = getUser(uid(ctx));
  await present(
    ctx,
    projectsListMarkdown(user.projects),
    projectsInlineKeyboard(user.projects),
  );
}

export async function showStatus(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  const user = getUser(uid(ctx));
  const active = user.activeSessionId
    ? user.sessions.find((s) => s.id === user.activeSessionId)
    : undefined;
  await present(
    ctx,
    statusMarkdown({
      sessionCount: user.sessions.length,
      projectCount: user.projects.length,
      activeTitle: active?.title,
    }),
    homeInlineKeyboard(),
  );
}

export async function showHelp(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  await present(ctx, helpMarkdown(), homeInlineKeyboard());
}

export async function openSession(ctx: Context, sessionId: string) {
  clearAwaitingProjectName(uid(ctx));
  const session = getSession(uid(ctx), sessionId);
  if (!session) {
    await present(ctx, notFoundMarkdown("chat"), homeInlineKeyboard());
    return;
  }
  setActiveSession(uid(ctx), session.id);
  await present(ctx, sessionDetailMarkdown(session), sessionActionsKeyboard(session));
}

export async function openProject(ctx: Context, projectId: string) {
  clearAwaitingProjectName(uid(ctx));
  const project = getProject(uid(ctx), projectId);
  if (!project) {
    await present(ctx, notFoundMarkdown("project"), homeInlineKeyboard());
    return;
  }
  await present(ctx, projectDetailMarkdown(project), projectActionsKeyboard(project));
}

export async function promptCreateProject(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  await present(ctx, newProjectMarkdown(), createProjectConfirmKeyboard());
}

export async function createProjectInstant(ctx: Context, name?: string) {
  const { project, session } = createProject(uid(ctx), name);
  await present(
    ctx,
    projectCreatedMarkdown(project, session),
    sessionActionsKeyboard(session),
  );
}

export async function askProjectName(ctx: Context) {
  const user = getUser(uid(ctx));
  user.awaitingProjectName = true;
  await ctx.reply("What should we call this project?", {
    reply_markup: { force_reply: true, input_field_placeholder: "e.g. Flux finance" },
  });
}

export async function showNewChatIdeas(ctx: Context) {
  clearAwaitingProjectName(uid(ctx));
  await present(ctx, newChatMarkdown(), newChatIdeasKeyboard());
}

export async function showComposeHint(ctx: Context) {
  const user = getUser(uid(ctx));
  user.awaitingProjectName = false;
  // reuse flag? better a compose mode - for cancel just clear via home
  await present(ctx, composeHintMarkdown(), homeInlineKeyboard());
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

  await ctx.api.sendChatAction(ctx.chat!.id, "typing").catch(() => undefined);

  try {
    await runDemoAgentReply(ctx, { prompt, session });
    appendMessage(uid(ctx), session.id, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Demo agent reply completed.",
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
    await ctx.reply("Something went wrong showing the demo reply. Try again in a moment.");
    throw err;
  }
}

export async function runIdea(ctx: Context, ideaKey: string) {
  const prompt = IDEA_PROMPTS[ideaKey];
  if (!prompt) {
    await showNewChatIdeas(ctx);
    return;
  }
  // Force a fresh chat for idea starters
  setActiveSession(uid(ctx), null);
  await handlePrompt(ctx, prompt);
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
    IDEA_PROMPTS.landing!;

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

  if (ctx.chat) {
    await ctx.api.sendChatAction(ctx.chat.id, "typing").catch(() => undefined);
  }

  try {
    await runDemoAgentReply(ctx, { prompt, session });
    if (session) {
      appendMessage(uid(ctx), session.id, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Demo agent reply completed.",
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
    await ctx.reply("Couldn’t run the demo just now. Try again?");
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
