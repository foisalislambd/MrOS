import { config } from "../config";
import type { DemoProject, DemoSession } from "../demo/types";
import { groupHeading } from "../keyboards/inline";
import { escapeRichInline } from "./safe";

export function welcomeMarkdown(opts: {
  name?: string;
  sessionCount: number;
  projectCount: number;
}) {
  const greet = opts.name
    ? `Hey **${escapeRichInline(opts.name)}**`
    : "Hey";
  return `# ${config.appName}

${greet} — your vibe coding control channel is live.

| | |
|:--|--:|
| Sessions | **${opts.sessionCount}** |
| Projects | **${opts.projectCount}** |

Pick a session below, create a project, or just type what you want to build.

*Demo UI — backend wiring comes next; this Telegram surface stays.*
`;
}

export function sessionsListMarkdown(
  grouped: Record<DemoSession["group"], DemoSession[]>,
) {
  const order: DemoSession["group"][] = ["today", "yesterday", "week", "older"];
  const parts: string[] = [`# Sessions\n`];

  for (const g of order) {
    const list = grouped[g];
    if (!list.length) continue;
    parts.push(`## ${groupHeading(g)}\n`);
    for (const s of list) {
      const tag = s.projectId ? "`project`" : "`chat`";
      parts.push(`- ${tag} **${escapeRichInline(s.title)}**`);
    }
    parts.push("");
  }

  if (parts.length === 1) {
    parts.push("_No sessions yet. Create a project or send a prompt._");
  }

  return parts.join("\n");
}

export function sessionDetailMarkdown(session: DemoSession) {
  const recent = session.messages.slice(-4);
  const history =
    recent.length === 0
      ? "_No messages yet — send a prompt to start._"
      : recent
          .map((m) => {
            const who = m.role === "user" ? "**You**" : "**MrOS**";
            const raw =
              m.content.length > 280 ? `${m.content.slice(0, 280)}…` : m.content;
            const body = escapeRichInline(raw);
            const files = m.files?.length
              ? `\n  - files: ${m.files.map((f) => `\`${f}\``).join(", ")}`
              : "";
            return `- ${who}: ${body}${files}`;
          })
          .join("\n");

  return `# ${escapeRichInline(session.title)}

| | |
|:--|--:|
| Session | \`${session.id.slice(0, 8)}\` |
| Project | ${session.projectId ? `\`${session.projectId.slice(0, 8)}\`` : "_none_"} |
| Messages | **${session.messages.length}** |

## Recent

${history}

Type a message to continue, or run **Demo AI Reply**.
`;
}

export function projectsListMarkdown(projects: DemoProject[]) {
  if (!projects.length) {
    return `# Projects\n\n_No projects yet. Tap **New Project** to create one with a UUID._`;
  }

  const rows = projects
    .map(
      (p) =>
        `| ${statusLabel(p.status)} | **${escapeRichInline(p.name)}** | \`${p.id.slice(0, 8)}\` |`,
    )
    .join("\n");

  return `# Projects

| Status | Name | ID |
|:-------|:-----|:---|
${rows}
`;
}

export function projectCreatedMarkdown(project: DemoProject, session: DemoSession) {
  return `# Project created

**${escapeRichInline(project.name)}** is ready.

| | |
|:--|--:|
| Project ID | \`${project.id}\` |
| Session ID | \`${session.id}\` |
| Status | **${project.status}** |

Send a prompt to start building, or tap **Demo AI Reply**.
`;
}

export function projectDetailMarkdown(project: DemoProject) {
  return `# ${escapeRichInline(project.name)}

| | |
|:--|--:|
| ID | \`${project.id}\` |
| Status | **${project.status}** |
| Updated | ${formatTime(project.updatedAt)} |

Use the buttons below to open the linked session or run a demo build.
`;
}

export function statusMarkdown(opts: {
  sessionCount: number;
  projectCount: number;
  activeTitle?: string | null;
}) {
  return `# ${config.appName} status

| | |
|:--|--:|
| Channel | **online** |
| Mode | **demo** (in-memory) |
| Sessions | **${opts.sessionCount}** |
| Projects | **${opts.projectCount}** |
| Active | ${opts.activeTitle ? `**${escapeRichInline(opts.activeTitle)}**` : "_none_"} |

Rich Messages + streaming drafts are wired. Connect the API when ready.
`;
}

export function helpMarkdown() {
  return `# Help

## Commands
- \`/start\` — welcome + sessions
- \`/new\` — create project (UUID)
- \`/sessions\` — list sessions
- \`/projects\` — list projects
- \`/status\` — bot status
- \`/demo\` — stream a demo AI reply
- \`/help\` — this message

## Keyboard
Use the bottom keyboard for **New Project**, **Sessions**, **Projects**, and **Demo AI Reply**.

## Inline
Type \`@your_bot \` in any chat to search sessions (inline mode).

## Tips
Just send a message — it becomes a prompt in your active session (or opens a new one).
`;
}

function statusLabel(status: DemoProject["status"]) {
  switch (status) {
    case "ready":
      return "✅ ready";
    case "building":
      return "🔨 building";
    case "failed":
      return "⚠️ failed";
    default:
      return "📝 draft";
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
