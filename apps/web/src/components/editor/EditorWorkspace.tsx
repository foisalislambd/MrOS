"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  ChevronRight,
  Code2,
  ExternalLink,
  Frame,
  Monitor,
  PanelLeft,
  Plus,
  RefreshCw,
  SendHorizontal,
  Smartphone,
  SquarePen,
  Tablet,
} from "lucide-react";

import { HistorySidebar, type ChatThread } from "./HistorySidebar";
import { IconButton } from "./IconButton";
import { IconLogo } from "./icons";
import { MockPreviewApp } from "./MockPreviewApp";
import { toast } from "./Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";
type Role = "user" | "assistant";
type MobilePane = "chat" | "preview";

type Message = {
  id: string;
  role: Role;
  content: string;
  files?: string[];
};

const FLUX_MESSAGES: Message[] = [
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

const INITIAL_THREADS: ChatThread[] = [
  { id: "flux", title: "Flux finance dashboard", group: "today" },
  { id: "landing", title: "SaaS landing page redesign", group: "today" },
  { id: "auth", title: "Auth flow with magic link", group: "yesterday" },
  { id: "portfolio", title: "Portfolio site for photographer", group: "yesterday" },
  { id: "crm", title: "Minimal CRM kanban board", group: "week" },
  { id: "docs", title: "Docs site with search", group: "week" },
  { id: "booking", title: "Appointment booking UI", group: "older" },
];

const THREAD_MESSAGES: Record<string, Message[]> = {
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
      content: "Laid out a hero-first landing with a strong brand mark and a single primary CTA. Preview is ready.",
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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function EditorWorkspace() {
  const isDesktop = useIsDesktop();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [mobilePane, setMobilePane] = useState<MobilePane>("chat");
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [chatMap, setChatMap] = useState<Record<string, Message[]>>(THREAD_MESSAGES);
  const [activeId, setActiveId] = useState("flux");
  const [search, setSearch] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [draft, setDraft] = useState("");
  const [building, setBuilding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hydrated = useRef(false);

  const messages = chatMap[activeId] ?? [];
  const activeThread = threads.find((t) => t.id === activeId);
  const projectTitle = activeThread?.title ?? "New chat";

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      setSidebarOpen(desktop);
      return;
    }
    if (isDesktop) {
      setMobilePane("chat");
    } else {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, building, activeId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (isDesktop) setChatOpen((v) => !v);
        else setMobilePane((v) => (v === "chat" ? "preview" : "chat"));
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "\\") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        createNewChat();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  function createNewChat() {
    const id = crypto.randomUUID();
    const thread: ChatThread = {
      id,
      title: "New chat",
      group: "today",
    };
    setThreads((prev) => [thread, ...prev]);
    setChatMap((prev) => ({ ...prev, [id]: [] }));
    setActiveId(id);
    setDraft("");
    setBuilding(false);
    setChatOpen(true);
    setMobilePane("chat");
    if (!isDesktop) setSidebarOpen(false);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }

  function selectChat(id: string) {
    setActiveId(id);
    setDraft("");
    setBuilding(false);
    setChatOpen(true);
    setMobilePane("chat");
    if (!isDesktop) setSidebarOpen(false);
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text || building) return;

    const threadId = activeId;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setChatMap((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] ?? []), userMsg],
    }));

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId && t.title === "New chat"
          ? { ...t, title: text.slice(0, 42) + (text.length > 42 ? "…" : "") }
          : t,
      ),
    );

    setDraft("");
    setBuilding(true);

    window.setTimeout(() => {
      setChatMap((prev) => ({
        ...prev,
        [threadId]: [
          ...(prev[threadId] ?? []),
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Applied your change and refreshed the preview. Tweak anything else and I’ll keep iterating.",
            files: ["src/App.tsx"],
          },
        ],
      }));
      setBuilding(false);
      setRefreshKey((k) => k + 1);
    }, 1600);
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const deviceWidth =
    device === "desktop" ? "100%" : device === "tablet" ? "768px" : "390px";

  const showChat = isDesktop ? chatOpen : mobilePane === "chat";
  const showPreview = isDesktop ? true : mobilePane === "preview";

  return (
    <TooltipProvider>
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <HistorySidebar
          open={sidebarOpen}
          threads={threads}
          activeId={activeId}
          search={search}
          onSearchChange={setSearch}
          onSelect={selectChat}
          onNewChat={createNewChat}
          onToggle={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border bg-bg-elevated px-2 sm:gap-2 sm:px-3">
            <IconButton
              label="Open sidebar"
              tooltip="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className={cn(sidebarOpen && isDesktop && "lg:hidden")}
            >
              <PanelLeft />
            </IconButton>
            <IconButton
              label="New chat"
              tooltip="New chat"
              onClick={createNewChat}
              className="lg:hidden"
            >
              <SquarePen />
            </IconButton>

            {!sidebarOpen && (
              <IconButton
                label="New chat"
                tooltip="New chat"
                onClick={createNewChat}
                className="hidden lg:inline-flex"
              >
                <SquarePen />
              </IconButton>
            )}

            <IconButton
              label={chatOpen ? "Collapse chat" : "Expand chat"}
              tooltip="Toggle chat (Ctrl+B)"
              onClick={() => setChatOpen((v) => !v)}
              className="hidden lg:inline-flex"
            >
              <PanelLeft className="rotate-180" />
            </IconButton>

            <Separator orientation="vertical" className="mx-0.5 hidden sm:block lg:mx-1" />

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <IconLogo className="hidden h-6 w-6 shrink-0 text-accent sm:block" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold tracking-tight text-white">
                    {projectTitle}
                  </span>
                  <ChevronRight className="hidden size-3.5 shrink-0 text-white/80 sm:block" strokeWidth={1.6} />
                </div>
                <p className="hidden truncate text-[11px] text-white/50 sm:block">
                  MrOS workspace
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                className="px-2.5 sm:px-3.5"
                onClick={() => toast.success("Ready to publish", { description: "Connect a project to go live." })}
              >
                Publish
              </Button>
              <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white sm:flex">
                IF
              </div>
            </div>
          </header>

          <div className="flex shrink-0 border-b border-border bg-bg-elevated px-2 py-1.5 lg:hidden">
            <ToggleGroup
              type="single"
              value={mobilePane}
              onValueChange={(value) => {
                if (value) setMobilePane(value as MobilePane);
              }}
              className="w-full"
            >
              <ToggleGroupItem value="chat" className="flex-1">
                Chat
              </ToggleGroupItem>
              <ToggleGroupItem value="preview" className="flex-1">
                Preview
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex min-h-0 flex-1">
            <aside
              className={cn(
                "min-h-0 flex-col border-r border-border bg-bg-chat transition-[width] duration-200 ease-out",
                showChat
                  ? "flex w-full flex-1 lg:w-[360px] lg:flex-none xl:w-[400px]"
                  : "hidden w-0 overflow-hidden border-r-0 lg:flex",
                !chatOpen && isDesktop && "!hidden !w-0 !flex-none !border-r-0",
              )}
            >
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4">
                <span className="text-xs font-semibold tracking-wide text-white/70 uppercase">
                  Chat
                </span>
                <Badge variant="soft">Build mode</Badge>
              </div>

              <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
                {messages.length === 0 && !building && (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-4 text-center">
                    <IconLogo className="mb-3 h-9 w-9 text-accent" />
                    <p className="text-sm font-semibold text-white">Start building</p>
                    <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-white/60">
                      Describe an app or a change. MrOS will update the live preview as you chat.
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <article key={msg.id}>
                    {msg.role === "user" ? (
                      <div className="ml-2 rounded-2xl rounded-br-md bg-bg-elevated px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-[var(--shadow-soft)] ring-1 ring-border sm:ml-6">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <IconLogo className="h-5 w-5 text-accent" />
                          <span className="text-xs font-semibold text-white/70">MrOS</span>
                        </div>
                        <p className="text-sm leading-relaxed text-white">{msg.content}</p>
                        {msg.files && msg.files.length > 0 && (
                          <ul className="flex flex-wrap gap-1.5">
                            {msg.files.map((file) => (
                              <li
                                key={file}
                                className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-white/70"
                              >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                                <span className="truncate">{file}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </article>
                ))}

                {building && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <IconLogo className="h-5 w-5 text-accent" />
                      <span className="text-xs font-semibold text-white/70">MrOS</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/65">
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
                        <span
                          className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </span>
                      Building…
                    </div>
                    <div className="building-bar h-0.5 rounded-full" />
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="border-t border-border p-2.5 sm:p-3">
                <div className="composer rounded-[var(--radius-panel)] border border-border bg-bg-elevated p-2 shadow-[var(--shadow-soft)] transition">
                  <Textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={3}
                    placeholder="Ask MrOS to change anything…"
                    className="max-h-32"
                  />
                  <div className="flex items-center justify-between px-1 pb-0.5">
                    <IconButton label="Attach" tooltip="Attach file">
                      <Plus />
                    </IconButton>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={sendMessage}
                      disabled={!draft.trim() || building}
                      className="gap-1.5"
                    >
                      Send
                      <SendHorizontal className="size-3.5" strokeWidth={1.7} />
                    </Button>
                  </div>
                </div>
                <p className="mt-2 hidden text-center text-[11px] text-white/40 sm:block">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </aside>

            <section
              className={cn(
                "min-w-0 flex-col bg-background",
                showPreview ? "flex flex-1" : "hidden lg:flex lg:flex-1",
              )}
            >
              <div className="flex h-11 shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-2 sm:gap-2 sm:px-3">
                <ToggleGroup
                  type="single"
                  value={tab}
                  onValueChange={(value) => {
                    if (value) setTab(value as "preview" | "code");
                  }}
                  size="sm"
                >
                  <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
                  <ToggleGroupItem value="code" className="gap-1">
                    <Code2 className="size-3.5" strokeWidth={1.6} />
                    Code
                  </ToggleGroupItem>
                </ToggleGroup>

                {tab === "preview" && (
                  <>
                    <Separator orientation="vertical" className="mx-1 hidden md:block" />
                    <ToggleGroup
                      type="single"
                      value={device}
                      onValueChange={(value) => {
                        if (value) setDevice(value as Device);
                      }}
                      size="icon"
                      className="hidden md:flex"
                    >
                      <ToggleGroupItem value="desktop" aria-label="Desktop">
                        <Monitor className="size-3.5" strokeWidth={1.6} />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="tablet" aria-label="Tablet">
                        <Tablet className="size-3.5" strokeWidth={1.6} />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="mobile" aria-label="Mobile">
                        <Smartphone className="size-3.5" strokeWidth={1.6} />
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <IconButton
                      label="Refresh preview"
                      tooltip="Refresh"
                      size="icon-sm"
                      onClick={() => setRefreshKey((k) => k + 1)}
                    >
                      <RefreshCw />
                    </IconButton>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="hidden h-7 gap-1 px-2 text-white/90 hover:bg-icon-hover hover:text-white sm:inline-flex"
                    >
                      <Frame className="size-3.5" strokeWidth={1.6} />
                      <span className="hidden md:inline">Select</span>
                    </Button>
                  </>
                )}

                <div className="ml-auto flex shrink-0 items-center gap-1">
                  <span className="mr-1 hidden items-center gap-1.5 text-[11px] text-white/50 md:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Live
                  </span>
                  <IconButton label="Open preview" tooltip="Open preview" size="icon-sm">
                    <ExternalLink />
                  </IconButton>
                </div>
              </div>

              <div className="relative flex min-h-0 flex-1 items-stretch justify-center p-2 sm:p-3 md:p-4">
                {tab === "preview" ? (
                  <div
                    key={refreshKey}
                    className="flex h-full max-h-full w-full overflow-hidden rounded-[var(--radius-panel)] border border-border bg-bg-elevated shadow-[var(--shadow-soft)]"
                    style={{
                      width: isDesktop ? deviceWidth : "100%",
                      maxWidth: "100%",
                    }}
                  >
                    <MockPreviewApp />
                  </div>
                ) : (
                  <div className="h-full w-full overflow-auto rounded-[var(--radius-panel)] border border-border bg-preview-chrome p-3 font-mono text-[12px] leading-6 text-[#e8e4de] shadow-[var(--shadow-soft)] sm:p-5 sm:text-[12.5px]">
                    <pre className="whitespace-pre-wrap break-words">{CODE_SNIPPET}</pre>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

const CODE_SNIPPET = `// src/App.tsx
export default function App() {
  return (
    <main className="flux-shell">
      <header>
        <p className="eyebrow">Flux</p>
        <h1>$12,480.00</h1>
        <p>Available balance</p>
      </header>
      <SpendChart />
      <Transactions />
    </main>
  );
}`;
