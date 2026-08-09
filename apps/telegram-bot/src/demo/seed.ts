import type { DemoMessage, DemoProject, DemoSession } from "./types";

const now = Date.now();

function iso(offsetMs: number) {
  return new Date(now - offsetMs).toISOString();
}

export const SEED_PROJECTS: DemoProject[] = [
  {
    id: "proj-flux",
    name: "Flux finance",
    status: "ready",
    createdAt: iso(1000 * 60 * 60 * 6),
    updatedAt: iso(1000 * 60 * 20),
  },
  {
    id: "proj-landing",
    name: "SaaS landing",
    status: "building",
    createdAt: iso(1000 * 60 * 60 * 28),
    updatedAt: iso(1000 * 60 * 90),
  },
  {
    id: "proj-auth",
    name: "Magic-link auth",
    status: "draft",
    createdAt: iso(1000 * 60 * 60 * 50),
    updatedAt: iso(1000 * 60 * 60 * 30),
  },
];

const FLUX_MESSAGES: DemoMessage[] = [
  {
    id: "m1",
    role: "user",
    content:
      "Build a clean personal finance dashboard called Flux. Soft light UI, weekly spend chart, recent transactions, and a quick-add expense button.",
    createdAt: iso(1000 * 60 * 60 * 5),
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Scaffolded Flux with a calm layout: balance header, weekly spend bars, and a transaction list. Preview is updating.",
    createdAt: iso(1000 * 60 * 60 * 4.9),
    files: ["src/App.tsx", "src/components/SpendChart.tsx", "src/components/Transactions.tsx"],
    tools: [
      {
        id: "t1",
        name: "create_file",
        args: { path: "src/App.tsx" },
        result: "created",
      },
      {
        id: "t2",
        name: "run_preview",
        args: { port: 5173 },
        result: "ready",
      },
    ],
  },
];

export function seedSessions(): DemoSession[] {
  return [
    {
      id: "flux",
      title: "Flux finance dashboard",
      projectId: "proj-flux",
      group: "today",
      updatedAt: iso(1000 * 60 * 20),
      messages: structuredClone(FLUX_MESSAGES),
    },
    {
      id: "landing",
      title: "SaaS landing page redesign",
      projectId: "proj-landing",
      group: "today",
      updatedAt: iso(1000 * 60 * 90),
      messages: [
        {
          id: "l1",
          role: "user",
          content:
            "Redesign my SaaS landing — bold headline, one CTA, full-bleed product shot.",
          createdAt: iso(1000 * 60 * 95),
        },
        {
          id: "l2",
          role: "assistant",
          content:
            "Laid out a hero-first landing with a strong brand mark and a single primary CTA.",
          createdAt: iso(1000 * 60 * 92),
          files: ["src/pages/Home.tsx", "src/components/Hero.tsx"],
        },
      ],
    },
    {
      id: "auth",
      title: "Auth flow with magic link",
      projectId: "proj-auth",
      group: "yesterday",
      updatedAt: iso(1000 * 60 * 60 * 30),
      messages: [
        {
          id: "a1",
          role: "user",
          content: "Build a magic-link auth flow with email input and a waiting state.",
          createdAt: iso(1000 * 60 * 60 * 31),
        },
      ],
    },
    {
      id: "portfolio",
      title: "Portfolio site for photographer",
      projectId: null,
      group: "yesterday",
      updatedAt: iso(1000 * 60 * 60 * 40),
      messages: [],
    },
    {
      id: "crm",
      title: "Minimal CRM kanban board",
      projectId: null,
      group: "week",
      updatedAt: iso(1000 * 60 * 60 * 24 * 4),
      messages: [],
    },
    {
      id: "docs",
      title: "Docs site with search",
      projectId: null,
      group: "week",
      updatedAt: iso(1000 * 60 * 60 * 24 * 5),
      messages: [],
    },
    {
      id: "booking",
      title: "Appointment booking UI",
      projectId: null,
      group: "older",
      updatedAt: iso(1000 * 60 * 60 * 24 * 20),
      messages: [],
    },
  ];
}

export function cloneSeedProjects(): DemoProject[] {
  return structuredClone(SEED_PROJECTS);
}
