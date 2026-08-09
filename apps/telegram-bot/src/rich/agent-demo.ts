import type { Context } from "grammy";
import type { DemoSession, DemoToolCall } from "../demo/types";
import { flattenPrompt, escapeRichInline } from "../format/safe";
import { sessionActionsKeyboard } from "../keyboards/inline";
import { streamAgentReply } from "./send";

const DEMO_FILES = [
  "src/App.tsx",
  "src/components/Hero.tsx",
  "src/index.css",
  "src/lib/theme.ts",
];

export function buildDemoToolCalls(prompt: string): DemoToolCall[] {
  const slug =
    prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "app";

  return [
    {
      id: crypto.randomUUID(),
      name: "read_workspace",
      args: { path: "." },
      result: "3 routes · 12 components",
    },
    {
      id: crypto.randomUUID(),
      name: "create_file",
      args: { path: `src/pages/${slug}.tsx` },
      result: "created",
    },
    {
      id: crypto.randomUUID(),
      name: "apply_patch",
      args: { files: DEMO_FILES.slice(0, 2) },
      result: "2 files updated",
    },
    {
      id: crypto.randomUUID(),
      name: "run_preview",
      args: { port: 5173 },
      result: "http://localhost:5173",
    },
  ];
}

export function finalAgentMarkdown(opts: {
  prompt: string;
  tools: DemoToolCall[];
  sessionTitle?: string;
}) {
  const { prompt, tools, sessionTitle } = opts;
  const toolRows = tools
    .map((t) => `| \`${t.name}\` | ${escapeRichInline(String(t.result ?? "ok"))} |`)
    .join("\n");

  const heading = escapeRichInline(sessionTitle ?? "MrOS agent");

  return `# ${heading}

Got it — working on:

> ${flattenPrompt(prompt)}

## Tools used

| Tool | Result |
|:-----|:-------|
${toolRows}

## Changes

- Scaffolded layout + hero composition
- Wired theme tokens and spacing
- Preview refreshed on port \`5173\`

\`\`\`tsx
export function Hero() {
  return (
    <section className="hero">
      <h1>MrOS</h1>
      <p>Build in chat. Ship from Telegram.</p>
    </section>
  );
}
\`\`\`

<details>
<summary>Files touched</summary>

- \`${DEMO_FILES[0]}\`
- \`${DEMO_FILES[1]}\`
- \`${DEMO_FILES[2]}\`
- \`${DEMO_FILES[3]}\`

</details>

---

*Demo reply — swap this stream for the real agent when the API is ready.*
`;
}

function thinkingHtml(label: string) {
  return `<tg-thinking>${escape(label)}</tg-thinking>`;
}

function toolsDraftMarkdown(tools: DemoToolCall[], revealed: number) {
  const lines = tools.slice(0, revealed).map((t, i) => {
    const args = JSON.stringify(t.args);
    return `${i + 1}. **${t.name}** \`${args}\` → *${t.result ?? "…"}*`;
  });
  return `## Running tools\n\n${lines.join("\n")}`;
}

function escape(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function runDemoAgentReply(
  ctx: Context,
  opts: {
    prompt: string;
    session?: DemoSession;
  },
) {
  const tools = buildDemoToolCalls(opts.prompt);
  const title = opts.session?.title;

  const steps = [
    { html: thinkingHtml("Planning the build…") },
    { html: thinkingHtml("Choosing tools…") },
    { markdown: toolsDraftMarkdown(tools, 1) },
    { markdown: toolsDraftMarkdown(tools, 2) },
    { markdown: toolsDraftMarkdown(tools, 4) },
    {
      markdown: `${toolsDraftMarkdown(tools, 4)}\n\n## Drafting UI…\n\nScaffolding hero + tokens.`,
    },
  ];

  const markdown = finalAgentMarkdown({
    prompt: opts.prompt,
    tools,
    sessionTitle: title,
  });

  return streamAgentReply(
    ctx,
    steps,
    { markdown },
    {
      reply_markup: opts.session
        ? sessionActionsKeyboard(opts.session)
        : undefined,
      delayMs: 380,
    },
  );
}
