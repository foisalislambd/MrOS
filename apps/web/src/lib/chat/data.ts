import type { ChatThread, Message } from "./types";

export const FLUX_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content:
      "Build a clean personal finance dashboard called Flux. Soft light UI, weekly spend chart, recent transactions, and a quick-add expense button.",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Got it — scaffolding Flux with a calm layout: balance header, weekly spend bars, and a transaction list. Preview is updating now.",
    files: ["src/App.tsx", "src/components/SpendChart.tsx", "src/components/Transactions.tsx"],
  },
  {
    id: "3",
    role: "user",
    content: "Make the accent coral and tighten the spacing on mobile.",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Updated the accent to coral and tightened mobile padding. Chart labels now wrap cleaner under 420px.",
    files: ["src/index.css", "src/components/SpendChart.tsx"],
  },
];

export const INITIAL_THREADS: ChatThread[] = [
  { id: "flux", title: "Flux finance dashboard", group: "today" },
  { id: "landing", title: "SaaS landing page redesign", group: "today" },
  { id: "auth", title: "Auth flow with magic link", group: "yesterday" },
  { id: "portfolio", title: "Portfolio site for photographer", group: "yesterday" },
  { id: "crm", title: "Minimal CRM kanban board", group: "week" },
  { id: "docs", title: "Docs site with search", group: "week" },
  { id: "booking", title: "Appointment booking UI", group: "older" },
];

export const THREAD_MESSAGES: Record<string, Message[]> = {
  flux: FLUX_MESSAGES,
  landing: [
    {
      id: "l1",
      role: "user",
      content: "Redesign my SaaS landing — bold headline, one CTA, full-bleed product shot.",
    },
    {
      id: "l2",
      role: "assistant",
      content:
        "Laid out a hero-first landing with a strong brand mark and a single primary CTA. Preview is ready.",
      files: ["src/pages/Home.tsx", "src/components/Hero.tsx"],
    },
  ],
  auth: [
    {
      id: "a1",
      role: "user",
      content: "Build a magic-link auth flow with email input and a waiting state.",
    },
    {
      id: "a2",
      role: "assistant",
      content: "Auth screens are in. Added email form, sent-state, and a calm waiting animation.",
      files: ["src/pages/Login.tsx"],
    },
  ],
  portfolio: [
    {
      id: "p1",
      role: "user",
      content: "Photographer portfolio — large images, minimal chrome, grid that feels editorial.",
    },
  ],
  crm: [
    {
      id: "c1",
      role: "user",
      content: "Minimal CRM with kanban columns: Lead, Active, Closed.",
    },
  ],
  docs: [
    {
      id: "d1",
      role: "user",
      content: "Docs site with sidebar nav and a search bar at the top.",
    },
  ],
  booking: [
    {
      id: "b1",
      role: "user",
      content: "Appointment booking UI with calendar and time slots.",
    },
  ],
};

export function titleFromPrompt(text: string) {
  return text.slice(0, 42) + (text.length > 42 ? "…" : "");
}
