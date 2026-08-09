"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  ImagePlus,
  LayoutTemplate,
  PanelLeft,
  Plus,
  SendHorizontal,
  SquarePen,
  Upload,
} from "lucide-react";

import { HistorySidebar } from "@/components/layout/HistorySidebar";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { IconButton } from "@/components/shared/IconButton";
import { toast } from "@/components/shared/Toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { INITIAL_THREADS, setPendingAgent } from "@/lib/chat";

const IMPORT_OPTIONS = [
  { id: "figma", label: "Import Figma", icon: LayoutTemplate },
  { id: "github", label: "Clone GitHub", icon: FolderGit2 },
  { id: "upload", label: "Upload files", icon: Upload },
  { id: "screenshot", label: "Screenshot", icon: ImagePlus },
] as const;

export function ChatHome() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sidebarReady = useRef(false);

  useEffect(() => {
    if (isDesktop === null) return;
    if (!sidebarReady.current) {
      sidebarReady.current = true;
      setSidebarOpen(isDesktop);
      return;
    }
    if (!isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop) inputRef.current?.focus();
  }, [isDesktop]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "b" || e.key === "\\")) {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setDraft("");
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function startAgent(prompt: string) {
    const text = prompt.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const id = crypto.randomUUID();
      setPendingAgent({ id, prompt: text });
      router.push(`/agent/${id}`);
    } catch {
      setSending(false);
      toast.error("Couldn’t start chat", {
        description: "Try again in a moment.",
      });
    }
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      startAgent(draft);
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <HistorySidebar
          open={sidebarOpen}
          threads={INITIAL_THREADS}
          activeId=""
          search={search}
          onSearchChange={setSearch}
          onSelect={(id) => {
            if (isDesktop === false) setSidebarOpen(false);
            router.push(`/agent/${id}`);
          }}
          onNewChat={() => {
            setDraft("");
            inputRef.current?.focus();
            if (isDesktop === false) setSidebarOpen(false);
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
                  onClick={() => {
                    setDraft("");
                    inputRef.current?.focus();
                  }}
                >
                  <SquarePen />
                </IconButton>
              </>
            )}
            <div className="min-w-0 flex-1" />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-primary-foreground"
              aria-label="Account"
            >
              FI
            </div>
          </header>

          <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-6">
            <div className="accent-wash pointer-events-none absolute inset-0" />

            <div className="relative w-full max-w-xl">
              <div className="mb-6 flex flex-col items-center text-center">
                <BrandLogo className="mb-3 h-9 w-9 text-accent" />
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  What should we build?
                </h1>
                <p className="mt-1.5 max-w-sm text-sm text-fg-subtle">
                  Describe an app, import a design, or drop a repo.
                </p>
              </div>

              <div className="composer rounded-xl border border-border bg-bg-elevated p-2 shadow-[var(--shadow-soft)]">
                <Textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={2}
                  placeholder="Build a personal finance dashboard…"
                  className="min-h-[56px] max-h-32 sm:min-h-[64px]"
                  aria-label="Describe what to build"
                />
                <div className="flex items-center justify-between gap-2 px-0.5 pt-0.5">
                  <IconButton
                    label="Attach"
                    tooltip="Attach file"
                    size="icon-sm"
                    onClick={() =>
                      toast.message("Attach file", {
                        description: "File uploads come next — describe files in chat for now.",
                      })
                    }
                  >
                    <Plus />
                  </IconButton>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => startAgent(draft)}
                    disabled={!draft.trim() || sending}
                    className="h-7 gap-1.5 px-2.5 text-xs"
                  >
                    {sending ? "Starting…" : "Send"}
                    <SendHorizontal className="size-3.5" strokeWidth={1.7} />
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                {IMPORT_OPTIONS.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 rounded-lg border-border bg-bg-elevated/80 px-2.5 text-[11px] font-medium text-fg-muted hover:bg-bg-muted hover:text-foreground"
                    onClick={() =>
                      toast.message(label, {
                        description: "Import wiring comes next — describe it in chat for now.",
                      })
                    }
                  >
                    <Icon className="size-3.5" strokeWidth={1.6} />
                    {label}
                  </Button>
                ))}
              </div>

              <p className="mt-4 text-center text-[11px] text-fg-faint">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
