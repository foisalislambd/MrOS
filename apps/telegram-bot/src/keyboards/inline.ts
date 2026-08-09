import { InlineKeyboard } from "grammy";
import type { DemoProject, DemoSession } from "../demo/types";

const GROUP_LABEL: Record<DemoSession["group"], string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This week",
  older: "Older",
};

export function sessionsInlineKeyboard(
  sessions: DemoSession[],
  opts?: { page?: number; pageSize?: number },
) {
  const pageSize = opts?.pageSize ?? 6;
  const page = opts?.page ?? 0;
  const start = page * pageSize;
  const slice = sessions.slice(start, start + pageSize);
  const kb = new InlineKeyboard();

  for (const s of slice) {
    const mark = s.projectId ? "◆" : "○";
    kb.text(`${mark} ${truncate(s.title, 28)}`, `session:${s.id}`).row();
  }

  const nav: { text: string; data: string }[] = [];
  if (page > 0) nav.push({ text: "‹ Prev", data: `sessions:page:${page - 1}` });
  if (start + pageSize < sessions.length) {
    nav.push({ text: "Next ›", data: `sessions:page:${page + 1}` });
  }
  if (nav.length === 1) kb.text(nav[0]!.text, nav[0]!.data).row();
  else if (nav.length === 2) {
    kb.text(nav[0]!.text, nav[0]!.data).text(nav[1]!.text, nav[1]!.data).row();
  }

  kb.text("🆕 New Project", "project:create")
    .text("✨ Demo AI", "demo:agent")
    .row()
    .text("📁 Projects", "projects:list")
    .text("🏠 Home", "home");

  return kb;
}

export function sessionActionsKeyboard(session: DemoSession) {
  const kb = new InlineKeyboard()
    .text("✨ Continue chat", `session:chat:${session.id}`)
    .text("✨ Demo reply", `demo:agent:${session.id}`)
    .row()
    .text("💬 All sessions", "sessions:page:0")
    .text("🏠 Home", "home");

  if (session.projectId) {
    kb.row().text("📁 Open project", `project:open:${session.projectId}`);
  } else {
    kb.row().text("🆕 Attach as project", `project:from_session:${session.id}`);
  }

  return kb;
}

export function projectsInlineKeyboard(projects: DemoProject[]) {
  const kb = new InlineKeyboard();
  for (const p of projects.slice(0, 8)) {
    kb.text(`${statusEmoji(p.status)} ${truncate(p.name, 26)}`, `project:open:${p.id}`).row();
  }
  kb.text("🆕 Create project", "project:create")
    .row()
    .text("💬 Sessions", "sessions:page:0")
    .text("🏠 Home", "home");
  return kb;
}

export function projectActionsKeyboard(project: DemoProject) {
  return new InlineKeyboard()
    .text("💬 Open session", `project:session:${project.id}`)
    .text("✨ Demo build", `demo:agent:project:${project.id}`)
    .row()
    .text("📁 All projects", "projects:list")
    .text("🏠 Home", "home");
}

export function createProjectConfirmKeyboard() {
  return new InlineKeyboard()
    .text("⚡ Instant create (UUID)", "project:create:instant")
    .row()
    .text("✏️ Name it first", "project:create:named")
    .row()
    .text("« Cancel", "home");
}

export function homeInlineKeyboard() {
  return new InlineKeyboard()
    .text("💬 Sessions", "sessions:page:0")
    .text("📁 Projects", "projects:list")
    .row()
    .text("🆕 New Project", "project:create")
    .text("✨ Demo AI Reply", "demo:agent");
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
