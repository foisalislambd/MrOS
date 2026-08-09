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
import { IconButton } from "@/components/shared/IconButton";
import { toast } from "@/components/shared/Toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useSidebarOpen } from "@/hooks/use-sidebar-open";
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
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  }, [setSidebarOpen]);

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
            if (!isDesktop) setSidebarOpen(false);
            router.push(`/agent/${id}`);
          }}
          onNewChat={() => {
            setDraft("");
            inputRef.current?.focus();
            if (!isDesktop) setSidebarOpen(false);
          }}
          onToggle={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="app-shell-header flex h-12 shrink-0 items-center gap-1.5 border-b border-border px-2 sm:gap-2 sm:px-3">
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-muted text-[12px] font-semibold text-white ring-1 ring-border"
              aria-label="Account"
            >
              FI
            </div>
          </header>

          <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 pt-4 pb-16 sm:px-6">
            <div className="accent-wash pointer-events-none absolute inset-0" />

            <div className="relative w-full max-w-[640px] -translate-y-6">
              <div className="mb-8 flex flex-col items-center text-center">
                <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em] text-white sm:text-[2.15rem]">
                  What can I help with?
                </h1>
              </div>

              <div className="composer rounded-[var(--radius-panel)] border border-border bg-bg-elevated p-2.5 shadow-[var(--shadow-soft)]">
                <Textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={2}
                  placeholder="Ask anything, or describe an app to build…"
                  className="min-h-[60px] max-h-36 px-2.5 text-[15px] text-white sm:min-h-[68px]"
                  aria-label="Message MrOS"
                />
                <div className="flex items-center justify-between gap-2 px-0.5 pt-1">
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
                    size="sm"
                    onClick={() => startAgent(draft)}
                    disabled={!draft.trim() || sending}
                    className="h-8 gap-1.5 px-3 text-[13px]"
                  >
                    {sending ? "Starting…" : "Send"}
                    <SendHorizontal className="size-3.5 text-white" strokeWidth={1.85} />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {IMPORT_OPTIONS.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 border-border bg-transparent px-3 text-[13px] font-medium text-white hover:bg-bg-muted hover:text-white"
                    onClick={() =>
                      toast.message(label, {
                        description: "Import wiring comes next — describe it in chat for now.",
                      })
                    }
                  >
                    <Icon className="size-4 text-white" strokeWidth={1.85} />
                    {label}
                  </Button>
                ))}
              </div>

            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
