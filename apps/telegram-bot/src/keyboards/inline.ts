import { InlineKeyboard } from "grammy";
import type { DemoProject, DemoSession } from "../demo/types";

const GROUP_LABEL: Record<DemoSession["group"], string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "Earlier this week",
  older: "Older",
};

export type Btn = { text: string; data: string };

/** Add buttons 2 per row; leftover single button gets its own row. */
export function addPairs(kb: InlineKeyboard, buttons: Btn[]) {
  for (let i = 0; i < buttons.length; i += 2) {
    const a = buttons[i]!;
    const b = buttons[i + 1];
    if (b) kb.text(a.text, a.data).text(b.text, b.data).row();
    else kb.text(a.text, a.data).row();
  }
  return kb;
}

const NAV_HOME: Btn[] = [
  { text: "📁 Projects", data: "projects:list" },
  { text: "❓ Help", data: "help" },
];

export function sessionsInlineKeyboard(
  sessions: DemoSession[],
  opts?: { page?: number; pageSize?: number; activeId?: string | null },
) {
  const pageSize = opts?.pageSize ?? 6;
  const page = opts?.page ?? 0;
  const start = page * pageSize;
  const slice = sessions.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize));
  const kb = new InlineKeyboard();

  addPairs(
    kb,
    slice.map((s) => {
      const active = opts?.activeId === s.id ? "• " : "";
      const mark = s.projectId ? "◆" : "○";
      return {
        text: `${active}${mark} ${truncate(s.title, 16)}`,
        data: `session:${s.id}`,
      };
    }),
  );

  const nav: Btn[] = [];
  if (page > 0) nav.push({ text: "‹ Prev", data: `sessions:page:${page - 1}` });
  if (start + pageSize < sessions.length) {
    nav.push({
      text: totalPages > 1 ? `Next › (${page + 1}/${totalPages})` : "Next ›",
      data: `sessions:page:${page + 1}`,
    });
  } else if (page > 0 && totalPages > 1) {
    nav.push({ text: `${page + 1}/${totalPages}`, data: `sessions:page:${page}` });
  }
  addPairs(kb, nav);

  // Primary actions first, then light nav
  addPairs(kb, [
    { text: "✨ New chat", data: "chat:new" },
    { text: "🆕 New project", data: "project:create" },
    { text: "⚡️ Try demo", data: "demo:agent" },
    ...NAV_HOME,
  ]);

  return kb;
}

export function sessionActionsKeyboard(session: DemoSession) {
  const buttons: Btn[] = [
    { text: "⚡️ Run demo AI", data: `demo:agent:${session.id}` },
    { text: "💬 All chats", data: "sessions:page:0" },
  ];

  if (session.projectId) {
    buttons.push({
      text: "📁 Open project",
      data: `project:open:${session.projectId}`,
    });
  } else {
    buttons.push({
      text: "🆕 Save as project",
      data: `project:from_session:${session.id}`,
    });
  }

  buttons.push({ text: "🏠 Home", data: "home" });

  return addPairs(new InlineKeyboard(), buttons);
}

export function projectsInlineKeyboard(projects: DemoProject[]) {
  const kb = new InlineKeyboard();

  addPairs(
    kb,
    projects.slice(0, 8).map((p) => ({
      text: `${statusEmoji(p.status)} ${truncate(p.name, 16)}`,
      data: `project:open:${p.id}`,
    })),
  );

  addPairs(kb, [
    { text: "🆕 New project", data: "project:create" },
    { text: "💬 Chats", data: "sessions:page:0" },
    { text: "🏠 Home", data: "home" },
  ]);

  return kb;
}

export function projectActionsKeyboard(project: DemoProject) {
  return addPairs(new InlineKeyboard(), [
    { text: "💬 Open chat", data: `project:session:${project.id}` },
    { text: "⚡️ Demo build", data: `demo:agent:project:${project.id}` },
    { text: "📁 All projects", data: "projects:list" },
    { text: "🏠 Home", data: "home" },
  ]);
}

export function createProjectConfirmKeyboard() {
  return addPairs(new InlineKeyboard(), [
    { text: "✅ Create now", data: "project:create:instant" },
    { text: "✏️ Name it", data: "project:create:named" },
    { text: "« Back", data: "home" },
  ]);
}

export function homeInlineKeyboard() {
  return addPairs(new InlineKeyboard(), [
    { text: "💬 Chats", data: "sessions:page:0" },
    { text: "📁 Projects", data: "projects:list" },
    { text: "🆕 New project", data: "project:create" },
    { text: "⚡️ Try demo", data: "demo:agent" },
    { text: "🏠 Home", data: "home" },
  ]);
}

export function newChatIdeasKeyboard() {
  return addPairs(new InlineKeyboard(), [
    { text: "💳 Finance app", data: "idea:finance" },
    { text: "🚀 Landing page", data: "idea:landing" },
    { text: "🔐 Auth flow", data: "idea:auth" },
    { text: "📅 Booking UI", data: "idea:booking" },
    { text: "✏️ Own idea…", data: "chat:compose" },
    { text: "« Back", data: "home" },
  ]);
}

export function afterAgentKeyboard(session: DemoSession) {
  return addPairs(new InlineKeyboard(), [
    { text: "💬 Open chat", data: `session:${session.id}` },
    { text: "⚡️ Run again", data: `demo:agent:${session.id}` },
    { text: "🆕 New project", data: "project:create" },
    { text: "🏠 Home", data: "home" },
  ]);
}

export function groupHeading(group: DemoSession["group"]) {
  return GROUP_LABEL[group];
}

export function statusEmoji(status: DemoProject["status"]) {
  switch (status) {
    case "ready":
      return "✅";
    case "building":
      return "🔨";
    case "failed":
      return "⚠️";
    default:
      return "📝";
  }
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
