"use client";

import {
  Folder,
  Library,
  MoreHorizontal,
  Search,
  Settings,
  SquarePen,
  PanelLeft,
} from "lucide-react";

import { IconButton } from "./IconButton";
import { IconLogo } from "./icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type ChatThread = {
  id: string;
  title: string;
  group: "today" | "yesterday" | "week" | "older";
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

const GROUP_LABEL: Record<ChatThread["group"], string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "Previous 7 days",
  older: "Older",
};

const GROUP_ORDER: ChatThread["group"][] = ["today", "yesterday", "week", "older"];

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
  const q = search.trim().toLowerCase();
  const filtered = q
    ? threads.filter((t) => t.title.toLowerCase().includes(q))
    : threads;

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: filtered.filter((t) => t.group === group),
  })).filter((g) => g.items.length > 0);

  const panel = (
    <div className="flex h-full w-[min(100vw,280px)] flex-col bg-bg-sidebar lg:w-[260px]">
      <div className="flex h-12 shrink-0 items-center gap-1 px-2.5">
        <IconButton
          label="Close sidebar"
          tooltip="Close sidebar"
          onClick={onToggle}
          className="hover:bg-icon-hover"
        >
          <PanelLeft />
        </IconButton>
        <div className="ml-0.5 flex min-w-0 items-center gap-2">
          <IconLogo className="h-5 w-5 shrink-0 text-accent" />
          <span className="truncate text-sm font-semibold tracking-tight">MrOS</span>
        </div>
        <IconButton
          label="New chat"
          tooltip="New chat"
          onClick={onNewChat}
          className="ml-auto hover:bg-icon-hover"
        >
          <SquarePen />
        </IconButton>
      </div>

      <div className="px-2.5 pb-2">
        <Button
          type="button"
          variant="soft"
          onClick={onNewChat}
          className="h-auto w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium"
        >
          <SquarePen className="size-4 text-accent" strokeWidth={1.6} />
          New chat
        </Button>
      </div>

      <div className="px-2.5 pb-2">
        <label className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-2.5 py-1.5 ring-1 ring-transparent transition focus-within:bg-bg-elevated focus-within:ring-border">
          <Search className="size-3.5 shrink-0 text-icon" strokeWidth={1.6} />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats"
            className="h-7 px-0"
          />
        </label>
      </div>

      <nav className="px-2.5 pb-2">
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 text-sm text-icon hover:bg-icon-hover hover:text-icon-active"
        >
          <Library className="size-4" strokeWidth={1.6} />
          Library
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 text-sm text-icon hover:bg-icon-hover hover:text-icon-active"
        >
          <Folder className="size-4" strokeWidth={1.6} />
          Projects
        </Button>
      </nav>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {grouped.length === 0 ? (
          <p className="px-2.5 py-4 text-center text-xs text-fg-subtle">No chats found</p>
        ) : (
          grouped.map(({ group, items }) => (
            <div key={group} className="mb-3">
              <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
                {GROUP_LABEL[group]}
              </p>
              <ul className="space-y-0.5">
                {items.map((thread) => {
                  const active = thread.id === activeId;
                  return (
                    <li key={thread.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => onSelect(thread.id)}
                        className={cn(
                          "flex w-full items-center rounded-lg px-2.5 py-2 text-left text-[13px] leading-snug transition-colors duration-200",
                          active
                            ? "bg-bg-elevated font-medium text-fg ring-1 ring-border"
                            : "text-icon hover:bg-icon-hover hover:text-icon-active",
                        )}
                      >
                        <span className="truncate pr-6">{thread.title}</span>
                      </button>
                      <IconButton
                        label="Chat options"
                        size="icon-xs"
                        className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 opacity-0 transition group-hover:inline-flex group-hover:opacity-100 hover:bg-icon-hover"
                      >
                        <MoreHorizontal />
                      </IconButton>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      <Separator className="opacity-80" />
      <div className="shrink-0 p-2.5">
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-icon-hover"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
            IF
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">Ifois</p>
            <p className="truncate text-[11px] text-fg-subtle">Free plan</p>
          </div>
          <Settings className="size-4 shrink-0 text-icon" strokeWidth={1.6} />
        </Button>
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
            "absolute inset-0 bg-black/60 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close sidebar overlay"
          onClick={onToggle}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 border-r border-border shadow-[var(--shadow-soft)] transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {panel}
        </aside>
      </div>

      <aside
        className={cn(
          "hidden h-full shrink-0 overflow-hidden border-r border-border transition-[width] duration-300 ease-out lg:block",
          open ? "w-[260px]" : "w-0 border-r-0",
        )}
        aria-hidden={!open}
      >
        {open ? panel : null}
      </aside>
    </>
  );
}
