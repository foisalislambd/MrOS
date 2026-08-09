import { config } from "../config";
import type { DemoProject, DemoSession } from "../demo/types";
import { groupHeading, statusEmoji } from "../keyboards/inline";
import { escapeRichInline } from "./safe";

export function welcomeMarkdown(opts: {
  name?: string;
  sessionCount: number;
  projectCount: number;
  activeTitle?: string | null;
  sessions?: Record<DemoSession["group"], DemoSession[]>;
}) {
  const greet = opts.name
    ? `Hey **${escapeRichInline(opts.name)}**`
    : "Hey there";

  const parts = [
    `# ${config.appName}`,
    ``,
    `${greet} 👋`,
    ``,
    `Build apps by chatting — pick a chat below, start a project, or just tell me what you want.`,
    ``,
    `**${opts.sessionCount}** chats · **${opts.projectCount}** projects` +
      (opts.activeTitle
        ? ` · active: **${escapeRichInline(opts.activeTitle)}**`
        : ""),
  ];

  if (opts.sessions) {
    const order: DemoSession["group"][] = ["today", "yesterday", "week", "older"];
    let shown = 0;
    for (const g of order) {
      const list = opts.sessions[g];
      if (!list.length) continue;
      // Keep home scannable — only first two groups in the body
      if (shown >= 2) break;
      shown++;
      parts.push(``, `### ${groupHeading(g)}`);
      for (const s of list.slice(0, 4)) {
        const mark = s.projectId ? "◆" : "○";
        parts.push(`- ${mark} **${escapeRichInline(s.title)}**`);
      }
      if (list.length > 4) parts.push(`- _+${list.length - 4} more_`);
    }
    if (shown === 0) {
      parts.push(
        ``,
        `_No chats yet. Tap **New chat** or type something like “Build a todo app.”_`,
      );
    }
  }

  parts.push(``, `_Tip: type anything to start building._`);

  return parts.join("\n");
}

export function sessionsListMarkdown(
  grouped: Record<DemoSession["group"], DemoSession[]>,
  opts?: { activeId?: string | null },
) {
  const order: DemoSession["group"][] = ["today", "yesterday", "week", "older"];
  const parts: string[] = [
    `# Your chats`,
    ``,
    `Tap a chat below to open it — or start a new one.`,
  ];

  let any = false;
  for (const g of order) {
    const list = grouped[g];
    if (!list.length) continue;
    any = true;
    parts.push(``, `### ${groupHeading(g)}`);
    for (const s of list) {
      const mark = s.projectId ? "◆" : "○";
      const active = opts?.activeId === s.id ? " ← open" : "";
      parts.push(
        `- ${mark} **${escapeRichInline(s.title)}**${active}`,
      );
    }
  }

  if (!any) {
    parts.push(
      ``,
      `_Nothing here yet. Tap **New chat** or describe an app to build._`,
    );
  }

  return parts.join("\n");
}

export function sessionDetailMarkdown(session: DemoSession) {
  const recent = session.messages.slice(-3);
  const history =
    recent.length === 0
      ? `_Empty chat — send a message like “Add a dark mode toggle.”_`
      : recent
          .map((m) => {
            const who = m.role === "user" ? "**You**" : `**${config.appName}**`;
            const raw =
              m.content.length > 160 ? `${m.content.slice(0, 160)}…` : m.content;
            return `- ${who}: ${escapeRichInline(raw)}`;
          })
          .join("\n");

  const link = session.projectId
    ? `Linked to a project`
    : `Not saved as a project yet`;

  return `# ${escapeRichInline(session.title)}

${link} · **${session.messages.length}** messages

### Recent
${history}

**What next?** Type a follow-up, or tap **Run demo AI** to see a sample build reply.
`;
}

export function projectsListMarkdown(projects: DemoProject[]) {
  if (!projects.length) {
    return `# Projects

_No projects yet._

Create one to keep a chat, files, and status together.`;
  }

  const rows = projects
    .map((p) => {
      const st = `${statusEmoji(p.status)} ${statusWord(p.status)}`;
      return `| ${st} | **${escapeRichInline(p.name)}** |`;
    })
    .join("\n");

  return `# Projects

Your saved builds — tap one to open.

| Status | Name |
|:-------|:-----|
${rows}
`;
}

export function projectCreatedMarkdown(project: DemoProject, session: DemoSession) {
  return `# You’re set ✨

**${escapeRichInline(project.name)}** is ready.

This chat is linked to the project. Tell me what to build, or try the demo AI.

_Ref: \`${project.id.slice(0, 8)}\`_`;
}

export function projectDetailMarkdown(project: DemoProject) {
  return `# ${escapeRichInline(project.name)}

${statusEmoji(project.status)} **${statusWord(project.status)}** · updated ${formatTime(project.updatedAt)}

Open the chat to keep building, or run a demo reply to preview the agent flow.
`;
}

export function newProjectMarkdown() {
  return `# New project

Create a project to keep this work together.

- **Create now** — ready in one tap
- **Name it** — choose a title first

Then just describe what you want to build.`;
}

export function newChatMarkdown() {
  return `# New chat

Pick an idea to start fast — or type your own prompt anytime.`;
}

export function composeHintMarkdown() {
  return `# Your turn

Send a message describing what to build.

Examples:
- “Build a calm finance dashboard”
- “SaaS landing with one strong CTA”
- “Magic-link login screen”

_Or /cancel to go back._`;
}

export function statusMarkdown(opts: {
  sessionCount: number;
  projectCount: number;
  activeTitle?: string | null;
}) {
  return `# All good ✅

**${config.appName}** is online.

| | |
|:--|--:|
| Chats | **${opts.sessionCount}** |
| Projects | **${opts.projectCount}** |
| Active | ${opts.activeTitle ? `**${escapeRichInline(opts.activeTitle)}**` : "_none_"} |

Demo mode — replies are simulated until the API is connected.`;
}

export function helpMarkdown() {
  return `# How to use ${config.appName}

**Easiest path**
1. Tap a chat, or **New chat**
2. Type what you want to build
3. Watch the demo AI reply (tools + preview)

**Handy commands**
- /start — home
- /new — new project
- /demo — sample AI reply
- /help — this guide

**Shortcuts**
Just send a normal message — it continues your open chat (or starts a new one).

Search chats from any chat with \`@\` + this bot’s username.`;
}

export function notFoundMarkdown(kind: "chat" | "project") {
  return kind === "chat"
    ? `# Chat not found\n\nIt may have been cleared. Head home and pick another.`
    : `# Project not found\n\nTry the projects list again.`;
}

export const IDEA_PROMPTS: Record<string, string> = {
  finance:
    "Build a clean personal finance dashboard called Flux. Soft light UI, weekly spend chart, recent transactions, and a quick-add expense button.",
  landing:
    "Redesign my SaaS landing — bold headline, one CTA, full-bleed product shot.",
  auth: "Build a magic-link auth flow with email input and a waiting state.",
  booking: "Appointment booking UI with calendar and time slots.",
};

function statusWord(status: DemoProject["status"]) {
  switch (status) {
    case "ready":
      return "Ready";
    case "building":
      return "Building";
    case "failed":
      return "Needs attention";
    default:
      return "Draft";
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
