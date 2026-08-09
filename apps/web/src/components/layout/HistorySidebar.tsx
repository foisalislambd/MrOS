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
  const [searchOpen, setSearchOpen] = useState(() => Boolean(search.trim()));
  const [recentsOpen, setRecentsOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
    if (search.trim()) setSearchOpen(true);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (searchOpen) {
          setSearchOpen(false);
          onSearchChange("");
          return;
        }
        onToggle();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, searchOpen, onToggle, onSearchChange]);

  useEffect(() => {
    if (open && searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [open, searchOpen]);

  function toggleSearch() {
    if (searchOpen) {
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
    <div
      ref={panelRef}
      className="flex h-full w-[min(100vw,280px)] flex-col bg-bg-elevated lg:w-[260px]"
    >
      <div className="flex h-12 shrink-0 items-center gap-1 px-2">
        <div className="flex h-8 w-8 items-center justify-center">
          <BrandLogo className="h-6 w-6 text-accent" />
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <IconButton
            label={searchOpen ? "Close search" : "Search chats"}
            tooltip="Search"
            onClick={toggleSearch}
            aria-pressed={searchOpen}
          >
            <Search />
          </IconButton>
          <IconButton
            label="Close sidebar"
            tooltip="Close sidebar"
            onClick={onToggle}
          >
            <PanelLeft />
          </IconButton>
        </div>
      </div>

      {searchOpen && (
        <div className="px-2 pb-1">
          <label className="flex items-center gap-2 rounded-lg bg-bg-muted px-3 py-1.5 ring-1 ring-border">
            <Search className="size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.6} />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search chats"
              className="h-7 px-0"
              aria-label="Search chats"
            />
          </label>
        </div>
      )}

      <div className="px-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onNewChat}
          className="h-10 w-full justify-start gap-2.5 rounded-lg px-2.5 text-[14px] font-normal text-foreground hover:bg-icon-hover hover:text-foreground"
        >
          <SquarePen className="size-4 text-icon" strokeWidth={1.6} />
          New chat
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => comingSoon("Library")}
          className="h-10 w-full justify-start gap-2.5 rounded-lg px-2.5 text-[14px] font-normal text-fg-muted hover:bg-icon-hover hover:text-foreground"
        >
          <Library className="size-4" strokeWidth={1.6} />
          Library
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => comingSoon("Projects")}
          className="h-10 w-full justify-start gap-2.5 rounded-lg px-2.5 text-[14px] font-normal text-fg-muted hover:bg-icon-hover hover:text-foreground"
        >
          <Folder className="size-4" strokeWidth={1.6} />
          Projects
        </Button>
      </div>

      <div className="scrollbar-thin mt-2 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <button
          type="button"
          onClick={() => setRecentsOpen((v) => !v)}
          aria-expanded={recentsOpen}
          className="mb-1 flex w-full items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] text-fg-subtle hover:text-fg-muted"
        >
          Recents
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200",
              !recentsOpen && "-rotate-90",
            )}
            strokeWidth={1.6}
          />
        </button>

        {recentsOpen &&
          (filtered.length === 0 ? (
            <p className="px-2.5 py-4 text-center text-xs text-fg-faint">No chats found</p>
          ) : (
            <div className="space-y-3">
              {grouped.map((group) => (
                <div key={group.key}>
                  {!q && (
                    <p className="mb-1 px-2.5 text-[11px] font-medium tracking-wide text-fg-faint">
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
                              "flex w-full items-center rounded-lg px-3 py-2 text-left text-[13.5px] leading-snug",
                              active
                                ? "bg-bg-elevated font-medium text-foreground ring-1 ring-border"
                                : "text-fg-muted hover:bg-icon-hover hover:text-foreground",
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

      <div className="shrink-0 border-t border-border p-2">
        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 hover:bg-icon-hover">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-primary-foreground"
            aria-hidden
          >
            FI
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">Foisal Islam</p>
            <p className="truncate text-[11px] text-fg-subtle">Free</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => comingSoon("Upgrade")}
            className="h-7 shrink-0 rounded-lg border-border bg-bg-elevated px-3 text-[12px] font-medium text-foreground hover:bg-bg-muted hover:text-foreground"
          >
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-overlay transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close sidebar overlay"
          tabIndex={open ? 0 : -1}
          onClick={onToggle}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Chat history"
          className={cn(
            "absolute inset-y-0 left-0 border-r border-border shadow-[var(--shadow-soft)] transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {panel}
        </aside>
      </div>

      <aside
        className={cn(
          "hidden h-full shrink-0 overflow-hidden border-r border-border transition-[width] duration-200 ease-out lg:block",
          open ? "w-[260px]" : "w-0 border-r-0",
        )}
        aria-hidden={!open}
        aria-label="Chat history"
      >
        {open ? panel : null}
      </aside>
    </>
  );
}
