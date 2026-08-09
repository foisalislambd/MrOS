"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Folder,
  Library,
  MoreHorizontal,
  PanelLeft,
  Search,
  SquarePen,
} from "lucide-react";

import { IconButton } from "@/components/shared/IconButton";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { toast } from "@/components/shared/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import type { ChatThread } from "@/lib/chat";
import { cn } from "@/lib/utils";

const GROUP_ORDER = ["today", "yesterday", "week", "older"] as const;
const GROUP_LABELS: Record<(typeof GROUP_ORDER)[number], string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "Previous 7 days",
  older: "Older",
};

type HistorySidebarProps = {
  open: boolean;
  threads: ChatThread[];
  activeId: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onToggle: () => void;
};

export function HistorySidebar({
  open,
  threads,
  activeId,
  search,
  onSearchChange,
  onSelect,
  onNewChat,
  onToggle,
}: HistorySidebarProps) {
  const isDesktop = useIsDesktop();
  const hasMounted = useHasMounted();
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentsOpen, setRecentsOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showSearch = searchOpen || Boolean(search.trim());
  const q = search.trim().toLowerCase();
  const filtered = q
    ? threads.filter((t) => t.title.toLowerCase().includes(q))
    : threads;

  const grouped = useMemo(() => {
    const map = new Map<(typeof GROUP_ORDER)[number], ChatThread[]>();
    for (const key of GROUP_ORDER) map.set(key, []);
    for (const thread of filtered) {
      map.get(thread.group)?.push(thread);
    }
    return GROUP_ORDER.map((key) => ({
      key,
      label: GROUP_LABELS[key],
      items: map.get(key) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (showSearch) {
          setSearchOpen(false);
          onSearchChange("");
          return;
        }
        onToggle();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, showSearch, onToggle, onSearchChange]);

  useEffect(() => {
    if (open && showSearch) {
      searchInputRef.current?.focus();
    }
  }, [open, showSearch]);

  function toggleSearch() {
    if (showSearch) {
      setSearchOpen(false);
      onSearchChange("");
      return;
    }
    setSearchOpen(true);
  }

  function comingSoon(feature: string) {
    toast.message(feature, {
      description: "Coming soon — use chat for now.",
    });
  }

  const panel = (
    <div className="app-shell-sidebar flex h-full w-[min(100vw,280px)] flex-col lg:w-[260px]">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
        <BrandLogo className="h-5 w-5 shrink-0 text-accent" />
        <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-white">
          MrOS
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <IconButton
            label={showSearch ? "Close search" : "Search chats"}
            tooltip="Search"
            size="icon-sm"
            onClick={toggleSearch}
            aria-pressed={showSearch}
          >
            <Search />
          </IconButton>
          <IconButton
            label="Close sidebar"
            tooltip="Close sidebar"
            size="icon-sm"
            onClick={onToggle}
          >
            <PanelLeft />
          </IconButton>
        </div>
      </div>

      {showSearch && (
        <div className="border-b border-border px-3 py-2">
          <label className="flex items-center gap-2 rounded-[var(--radius-control)] bg-bg-muted px-2.5 py-1.5 ring-1 ring-border">
            <Search className="size-4 shrink-0 text-white" strokeWidth={1.85} />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search chats"
              className="h-7 px-0 text-[14px] text-white"
              aria-label="Search chats"
            />
          </label>
        </div>
      )}

      <div className="space-y-0.5 px-2 pt-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onNewChat}
          className="h-8 w-full justify-start gap-2 rounded-[var(--radius-control)] px-2.5 text-[12px] font-medium text-white hover:bg-icon-hover hover:text-white"
        >
          <SquarePen className="size-3.5 text-white" strokeWidth={1.85} />
          New chat
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => comingSoon("Library")}
          className="h-8 w-full justify-start gap-2 rounded-[var(--radius-control)] px-2.5 text-[12px] font-normal text-white/90 hover:bg-icon-hover hover:text-white"
        >
          <Library className="size-3.5 text-white" strokeWidth={1.85} />
          Library
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => comingSoon("Projects")}
          className="h-8 w-full justify-start gap-2 rounded-[var(--radius-control)] px-2.5 text-[12px] font-normal text-white/90 hover:bg-icon-hover hover:text-white"
        >
          <Folder className="size-3.5 text-white" strokeWidth={1.85} />
          Projects
        </Button>
      </div>

      <div className="scrollbar-thin mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <button
          type="button"
          onClick={() => setRecentsOpen((v) => !v)}
          aria-expanded={recentsOpen}
          className="mb-1 flex w-full items-center gap-1 rounded-[var(--radius-control)] px-2.5 py-1.5 text-[12px] font-medium tracking-[0.04em] text-white/65 uppercase hover:text-white"
        >
          Recents
          <ChevronDown
            className={cn(
              "size-4 text-white transition-transform duration-200",
              !recentsOpen && "-rotate-90",
            )}
            strokeWidth={1.85}
          />
        </button>

        {recentsOpen &&
          (filtered.length === 0 ? (
            <p className="px-2.5 py-6 text-center text-[13px] text-white/55">No chats found</p>
          ) : (
            <div className="space-y-3">
              {grouped.map((group) => (
                <div key={group.key}>
                  {!q && (
                    <p className="mb-1 px-2.5 text-[12px] font-medium text-white/55">
                      {group.label}
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {group.items.map((thread) => {
                      const active = thread.id === activeId;
                      return (
                        <li key={thread.id} className="group relative">
                          <button
                            type="button"
                            onClick={() => onSelect(thread.id)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex w-full items-center rounded-[var(--radius-control)] px-2.5 py-1.5 text-left text-[12px] leading-snug transition-colors",
                              active
                                ? "bg-bg-muted font-medium text-white"
                                : "text-white/85 hover:bg-icon-hover hover:text-white",
                            )}
                          >
                            <span className="truncate pr-7">{thread.title}</span>
                          </button>
                          <IconButton
                            label="Chat options"
                            tooltip="Options"
                            size="icon-xs"
                            className="absolute top-1/2 right-1.5 -translate-y-1/2 opacity-100 hover:bg-icon-hover sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              comingSoon("Chat options");
                            }}
                          >
                            <MoreHorizontal />
                          </IconButton>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
      </div>

      <div className="shrink-0 border-t border-border p-2.5">
        <div className="flex items-center gap-2.5 rounded-[var(--radius-control)] px-1.5 py-1.5 hover:bg-icon-hover">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-muted text-[12px] font-semibold text-white ring-1 ring-border"
            aria-hidden
          >
            FI
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-white">Foisal Islam</p>
            <p className="truncate text-[12px] text-white/70">Business plan</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => comingSoon("Upgrade")}
            className="h-8 shrink-0 px-2.5 text-[12px] font-medium text-white"
          >
            Manage
          </Button>
        </div>
      </div>
    </div>
  );

  const mobileVisible = hasMounted && !isDesktop && open;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          mobileVisible ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileVisible}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-overlay transition-opacity duration-200",
            mobileVisible ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close sidebar overlay"
          tabIndex={mobileVisible ? 0 : -1}
          onClick={onToggle}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Chat history"
          className={cn(
            "absolute inset-y-0 left-0 border-r border-border shadow-[var(--shadow-soft)] transition-transform duration-200 ease-out",
            mobileVisible ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {mobileVisible ? panel : null}
        </aside>
      </div>

      <aside
        className={cn(
          "hidden h-full shrink-0 overflow-hidden border-r border-border lg:block",
          open ? "w-[260px]" : "w-0 border-r-0",
        )}
        aria-hidden={!open}
        aria-label="Chat history"
      >
        {!mobileVisible && open ? panel : null}
      </aside>
    </>
  );
}
