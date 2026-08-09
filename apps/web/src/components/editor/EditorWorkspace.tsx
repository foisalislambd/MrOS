"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  IconChevron,
  IconCode,
  IconDesktop,
  IconExternal,
  IconHistory,
  IconLogo,
  IconPanel,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconSelect,
  IconSend,
  IconTablet,
} from "./icons";
import { MockPreviewApp } from "./MockPreviewApp";

type Device = "desktop" | "tablet" | "mobile";
type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
  files?: string[];
  building?: boolean;
};

const INITIAL_MESSAGES: Message[] = [
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
    building: false,
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

export function EditorWorkspace() {
  const [chatOpen, setChatOpen] = useState(true);
  const [device, setDevice] = useState<Device>("desktop");
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [building, setBuilding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, building]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setChatOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function sendMessage() {
    const text = draft.trim();
    if (!text || building) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setBuilding(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Applied your change and refreshed the preview. Tweak anything else and I’ll keep iterating.",
          files: ["src/App.tsx"],
        },
      ]);
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

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-bg-elevated px-3">
        <button
          type="button"
          onClick={() => setChatOpen((v) => !v)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-fg-muted transition hover:bg-bg-muted hover:text-fg"
          aria-label={chatOpen ? "Collapse chat" : "Expand chat"}
          title="Toggle chat (Ctrl+B)"
        >
          <IconPanel className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <IconLogo className="h-6 w-6 shrink-0 text-accent" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold tracking-tight">
                Flux Finance
              </span>
              <IconChevron className="h-3.5 w-3.5 text-fg-subtle" />
            </div>
            <p className="truncate text-[11px] text-fg-subtle">MrOS workspace</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            className="hidden h-8 items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 text-xs font-medium text-fg-muted transition hover:bg-bg-muted hover:text-fg sm:inline-flex"
          >
            <IconHistory className="h-3.5 w-3.5" />
            History
          </button>
          <button
            type="button"
            className="h-8 rounded-[var(--radius-control)] bg-accent px-3.5 text-xs font-semibold text-white transition hover:bg-accent-hover"
          >
            Publish
          </button>
          <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-fg text-[11px] font-semibold text-bg-elevated">
            IF
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`flex min-h-0 shrink-0 flex-col border-r border-border bg-bg-chat transition-[width,opacity] duration-300 ease-out ${
            chatOpen ? "w-full opacity-100 sm:w-[380px] lg:w-[420px]" : "w-0 overflow-hidden border-r-0 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-fg-muted uppercase">
              Chat
            </span>
            <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
              Build mode
            </span>
          </div>

          <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <article
                key={msg.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 4) * 40}ms` }}
              >
                {msg.role === "user" ? (
                  <div className="ml-6 rounded-2xl rounded-br-md bg-bg-elevated px-3.5 py-2.5 text-sm leading-relaxed shadow-[var(--shadow-soft)] ring-1 ring-border">
                    {msg.content}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <IconLogo className="h-5 w-5 text-accent" />
                      <span className="text-xs font-semibold text-fg-muted">MrOS</span>
                    </div>
                    <p className="text-sm leading-relaxed text-fg">{msg.content}</p>
                    {msg.files && msg.files.length > 0 && (
                      <ul className="space-y-1">
                        {msg.files.map((file) => (
                          <li
                            key={file}
                            className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-bg-muted px-2 py-1 font-mono text-[11px] text-fg-muted"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
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
              <div className="animate-fade-up space-y-2">
                <div className="flex items-center gap-2">
                  <IconLogo className="h-5 w-5 text-accent" />
                  <span className="text-xs font-semibold text-fg-muted">MrOS</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-fg-muted">
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

          <div className="border-t border-border p-3">
            <div className="composer rounded-[var(--radius-panel)] border border-border bg-bg-elevated p-2 shadow-[var(--shadow-soft)] transition">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={3}
                placeholder="Ask MrOS to change anything…"
                className="w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed text-fg outline-none placeholder:text-fg-subtle"
              />
              <div className="flex items-center justify-between px-1 pb-0.5">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-fg-muted transition hover:bg-bg-muted hover:text-fg"
                  aria-label="Attach"
                >
                  <IconPlus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!draft.trim() || building}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-control)] bg-fg px-3 text-xs font-semibold text-bg-elevated transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Send
                  <IconSend className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-fg-subtle">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-bg">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
            <div className="flex rounded-[var(--radius-control)] bg-bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`rounded-[8px] px-2.5 py-1 text-xs font-medium transition ${
                  tab === "preview"
                    ? "bg-bg-elevated text-fg shadow-sm"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setTab("code")}
                className={`inline-flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-xs font-medium transition ${
                  tab === "code"
                    ? "bg-bg-elevated text-fg shadow-sm"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                <IconCode className="h-3.5 w-3.5" />
                Code
              </button>
            </div>

            {tab === "preview" && (
              <>
                <div className="mx-1 hidden h-4 w-px bg-border sm:block" />
                <div className="hidden items-center gap-0.5 rounded-[var(--radius-control)] bg-bg-muted p-0.5 sm:flex">
                  {(
                    [
                      ["desktop", IconDesktop],
                      ["tablet", IconTablet],
                      ["mobile", IconPhone],
                    ] as const
                  ).map(([id, Icon]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setDevice(id)}
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-[8px] transition ${
                        device === id
                          ? "bg-bg-elevated text-fg shadow-sm"
                          : "text-fg-muted hover:text-fg"
                      }`}
                      aria-label={id}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setRefreshKey((k) => k + 1)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-control)] text-fg-muted transition hover:bg-bg-muted hover:text-fg"
                  aria-label="Refresh preview"
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1 rounded-[var(--radius-control)] px-2 text-xs font-medium text-fg-muted transition hover:bg-bg-muted hover:text-fg"
                >
                  <IconSelect className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Select</span>
                </button>
              </>
            )}

            <div className="ml-auto flex items-center gap-1">
              <span className="mr-2 hidden items-center gap-1.5 text-[11px] text-fg-subtle md:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Live
              </span>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-control)] text-fg-muted transition hover:bg-bg-muted hover:text-fg"
                aria-label="Open preview"
              >
                <IconExternal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-stretch justify-center p-3 sm:p-4">
            {tab === "preview" ? (
              <div
                key={refreshKey}
                className="animate-fade-up flex h-full max-h-full overflow-hidden rounded-[var(--radius-panel)] border border-border bg-bg-elevated shadow-[var(--shadow-soft)] transition-[width] duration-300"
                style={{ width: deviceWidth, maxWidth: "100%" }}
              >
                <MockPreviewApp />
              </div>
            ) : (
              <div className="animate-fade-up h-full w-full overflow-auto rounded-[var(--radius-panel)] border border-border bg-preview-chrome p-5 font-mono text-[12.5px] leading-6 text-[#e8e4de] shadow-[var(--shadow-soft)]">
                <pre className="whitespace-pre-wrap">{CODE_SNIPPET}</pre>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
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
