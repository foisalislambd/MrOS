"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
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

import { HistorySidebar } from "@/components/layout/HistorySidebar";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { IconButton } from "@/components/shared/IconButton";
import { toast } from "@/components/shared/Toast";
import { CodeExplorer } from "@/components/workspace/CodeExplorer";
import { MockPreviewApp } from "@/components/workspace/MockPreviewApp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import {
  consumePendingAgent,
  INITIAL_THREADS,
  THREAD_MESSAGES,
  titleFromPrompt,
  type ChatThread,
  type Message,
} from "@/lib/chat";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";
type MobilePane = "chat" | "preview";

function seedFromAgentId(agentId: string): {
  threads: ChatThread[];
  chatMap: Record<string, Message[]>;
  bootstrapPrompt: string | null;
} {
  const known = THREAD_MESSAGES[agentId];
  if (known) {
    return {
      threads: INITIAL_THREADS,
      chatMap: { ...THREAD_MESSAGES },
      bootstrapPrompt: null,
    };
  }

  const pending = consumePendingAgent(agentId);
  if (pending) {
    const thread: ChatThread = {
      id: agentId,
      title: titleFromPrompt(pending.prompt),
      group: "today",
    };
    return {
      threads: [thread, ...INITIAL_THREADS],
      chatMap: {
        ...THREAD_MESSAGES,
        [agentId]: [
          {
            id: crypto.randomUUID(),
            role: "user",
            content: pending.prompt,
          },
        ],
      },
      bootstrapPrompt: pending.prompt,
    };
  }

  const thread: ChatThread = {
    id: agentId,
    title: "New chat",
    group: "today",
  };
  return {
    threads: [thread, ...INITIAL_THREADS],
    chatMap: { ...THREAD_MESSAGES, [agentId]: [] },
    bootstrapPrompt: null,
  };
}

export function EditorWorkspace({ agentId }: { agentId: string }) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const seeded = useRef<ReturnType<typeof seedFromAgentId> | null>(null);
  if (!seeded.current) {
    seeded.current = seedFromAgentId(agentId);
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>("chat");
  const [threads, setThreads] = useState<ChatThread[]>(seeded.current.threads);
  const [chatMap, setChatMap] = useState<Record<string, Message[]>>(seeded.current.chatMap);
  const [search, setSearch] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [draft, setDraft] = useState("");
  const [building, setBuilding] = useState(Boolean(seeded.current.bootstrapPrompt));
  const [refreshKey, setRefreshKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hydrated = useRef(false);
  const bootstrapped = useRef(false);

  const messages = chatMap[agentId] ?? [];
  const activeThread = threads.find((t) => t.id === agentId);
  const projectTitle = activeThread?.title ?? "New chat";

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setSidebarOpen(window.matchMedia("(min-width: 1024px)").matches);
      return;
    }
    if (isDesktop) setMobilePane("chat");
    else setSidebarOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, building, agentId]);

  useEffect(() => {
    if (bootstrapped.current) return;
    if (!seeded.current?.bootstrapPrompt) return;
    bootstrapped.current = true;

    const threadId = agentId;
    window.setTimeout(() => {
      setChatMap((prev) => ({
        ...prev,
        [threadId]: [
          ...(prev[threadId] ?? []),
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Got it — scaffolding your project now. Preview is live; keep chatting to iterate.",
            files: ["src/App.tsx"],
          },
        ],
      }));
      setBuilding(false);
      setRefreshKey((k) => k + 1);
    }, 1600);
  }, [agentId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (isDesktop) setSidebarOpen((v) => !v);
        else setMobilePane((v) => (v === "chat" ? "preview" : "chat"));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        router.push("/");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDesktop, router]);

  function sendMessage() {
    const text = draft.trim();
    if (!text || building) return;

    const threadId = agentId;
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
          ? { ...t, title: titleFromPrompt(text) }
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

  const showChat = isDesktop ? true : mobilePane === "chat";
  const showPreview = isDesktop ? true : mobilePane === "preview";

  return (
    <TooltipProvider>
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <HistorySidebar
          open={sidebarOpen}
          threads={threads}
          activeId={agentId}
          search={search}
          onSearchChange={setSearch}
          onSelect={(id) => {
            if (!isDesktop) setSidebarOpen(false);
            router.push(`/agent/${id}`);
          }}
          onNewChat={() => {
            if (!isDesktop) setSidebarOpen(false);
            router.push("/");
          }}
          onToggle={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border bg-bg-elevated px-2 sm:gap-2 sm:px-3">
            {!sidebarOpen && (
              <>
                <IconButton
                  label="Open sidebar"
                  tooltip="Open sidebar"
                  onClick={() => setSidebarOpen(true)}
                >
                  <PanelLeft />
                </IconButton>
                <IconButton
                  label="New chat"
                  tooltip="New chat"
                  onClick={() => router.push("/")}
                >
                  <SquarePen />
                </IconButton>
                <Separator orientation="vertical" className="mx-0.5 hidden sm:block lg:mx-1" />
              </>
            )}

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <BrandLogo className="hidden h-6 w-6 shrink-0 text-accent sm:block" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold tracking-tight text-white">
                    {projectTitle}
                  </span>
                  <ChevronRight
                    className="hidden size-3.5 shrink-0 text-white/80 sm:block"
                    strokeWidth={1.6}
                  />
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
                onClick={() =>
                  toast.success("Ready to publish", {
                    description: "Connect a project to go live.",
                  })
                }
              >
                Publish
              </Button>
              <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white sm:flex">
                FI
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
                "min-h-0 flex-col border-r border-border bg-bg-chat",
                showChat
                  ? "flex w-full flex-1 lg:w-[360px] lg:flex-none xl:w-[400px]"
                  : "hidden w-0 overflow-hidden border-r-0 lg:flex",
              )}
            >
              <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-3 sm:px-4">
                <span className="text-xs font-semibold tracking-wide text-white/70 uppercase">
                  Chat
                </span>
                <Badge variant="soft">Build mode</Badge>
              </div>

              <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
                {messages.length === 0 && !building && (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-4 text-center">
                    <BrandLogo className="mb-3 h-9 w-9 text-accent" />
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
                          <BrandLogo className="h-5 w-5 text-accent" />
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
                      <BrandLogo className="h-5 w-5 text-accent" />
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

              <div className="relative flex min-h-0 flex-1 items-stretch justify-center">
                {tab === "preview" ? (
                  <div
                    key={refreshKey}
                    className="flex h-full max-h-full w-full overflow-hidden border-border bg-bg-elevated"
                    style={{
                      width: isDesktop ? deviceWidth : "100%",
                      maxWidth: "100%",
                    }}
                  >
                    <MockPreviewApp />
                  </div>
                ) : (
                  <CodeExplorer />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
