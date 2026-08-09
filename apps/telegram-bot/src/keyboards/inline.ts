import { InlineKeyboard } from "grammy";
import type { DemoProject, DemoSession } from "../demo/types";

const GROUP_LABEL: Record<DemoSession["group"], string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This week",
  older: "Older",
};

type Btn = { text: string; data: string };

/** Add buttons 2 per row; leftover single button gets its own row. */
function addPairs(kb: InlineKeyboard, buttons: Btn[]) {
  for (let i = 0; i < buttons.length; i += 2) {
    const a = buttons[i]!;
    const b = buttons[i + 1];
    if (b) kb.text(a.text, a.data).text(b.text, b.data).row();
    else kb.text(a.text, a.data).row();
  }
  return kb;
}

export function sessionsInlineKeyboard(
  sessions: DemoSession[],
  opts?: { page?: number; pageSize?: number },
) {
  const pageSize = opts?.pageSize ?? 6;
  const page = opts?.page ?? 0;
  const start = page * pageSize;
  const slice = sessions.slice(start, start + pageSize);
  const kb = new InlineKeyboard();

  addPairs(
    kb,
    slice.map((s) => ({
      text: `${s.projectId ? "◆" : "○"} ${truncate(s.title, 18)}`,
      data: `session:${s.id}`,
    })),
  );

  const nav: Btn[] = [];
  if (page > 0) nav.push({ text: "‹ Prev", data: `sessions:page:${page - 1}` });
  if (start + pageSize < sessions.length) {
    nav.push({ text: "Next ›", data: `sessions:page:${page + 1}` });
  }
  addPairs(kb, nav);

  addPairs(kb, [
    { text: "🆕 New Project", data: "project:create" },
    { text: "✨ Demo AI", data: "demo:agent" },
    { text: "📁 Projects", data: "projects:list" },
    { text: "🏠 Home", data: "home" },
  ]);

  return kb;
}

export function sessionActionsKeyboard(session: DemoSession) {
  const kb = new InlineKeyboard();
  const buttons: Btn[] = [
    { text: "✨ Continue", data: `session:chat:${session.id}` },
    { text: "✨ Demo reply", data: `demo:agent:${session.id}` },
    { text: "💬 Sessions", data: "sessions:page:0" },
    { text: "🏠 Home", data: "home" },
  ];

  if (session.projectId) {
    buttons.push({ text: "📁 Open project", data: `project:open:${session.projectId}` });
  } else {
    buttons.push({
      text: "🆕 Attach project",
      data: `project:from_session:${session.id}`,
    });
  }

  return addPairs(kb, buttons);
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
    { text: "🆕 Create", data: "project:create" },
    { text: "💬 Sessions", data: "sessions:page:0" },
    { text: "🏠 Home", data: "home" },
  ]);

  return kb;
}

export function projectActionsKeyboard(project: DemoProject) {
  return addPairs(new InlineKeyboard(), [
    { text: "💬 Open session", data: `project:session:${project.id}` },
    { text: "✨ Demo build", data: `demo:agent:project:${project.id}` },
    { text: "📁 Projects", data: "projects:list" },
    { text: "🏠 Home", data: "home" },
  ]);
}

export function createProjectConfirmKeyboard() {
  return addPairs(new InlineKeyboard(), [
    { text: "⚡ Instant (UUID)", data: "project:create:instant" },
    { text: "✏️ Name first", data: "project:create:named" },
    { text: "« Cancel", data: "home" },
  ]);
}

export function homeInlineKeyboard() {
  return addPairs(new InlineKeyboard(), [
    { text: "💬 Sessions", data: "sessions:page:0" },
    { text: "📁 Projects", data: "projects:list" },
    { text: "🆕 New Project", data: "project:create" },
    { text: "✨ Demo AI", data: "demo:agent" },
  ]);
}

export function groupHeading(group: DemoSession["group"]) {
  return GROUP_LABEL[group];
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function statusEmoji(status: DemoProject["status"]) {
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
