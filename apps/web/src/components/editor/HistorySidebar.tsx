"use client";

import { useState } from "react";
import {
  ChevronDown,
  Folder,
  Library,
  MoreHorizontal,
  Search,
  SquarePen,
  PanelLeft,
} from "lucide-react";

import { IconButton } from "./IconButton";
import { IconLogo } from "./icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentsOpen, setRecentsOpen] = useState(true);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? threads.filter((t) => t.title.toLowerCase().includes(q))
    : threads;

  const panel = (
    <div className="flex h-full w-[min(100vw,280px)] flex-col bg-black lg:w-[260px]">
      {/* Header: logo left, search + toggle right */}
      <div className="flex h-12 shrink-0 items-center gap-1 px-2">
        <div className="flex h-8 w-8 items-center justify-center">
          <IconLogo className="h-6 w-6 text-accent" />
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <IconButton
            label="Search chats"
            tooltip="Search"
            onClick={() => setSearchOpen((v) => !v)}
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
          <label className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5">
            <Search className="size-3.5 shrink-0 text-white/50" strokeWidth={1.6} />
            <Input
              autoFocus
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search chats"
              className="h-7 px-0"
            />
          </label>
        </div>
      )}

      {/* Primary actions */}
      <div className="px-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onNewChat}
          className="h-10 w-full justify-start gap-2.5 rounded-lg px-2.5 text-[14px] font-normal text-white hover:bg-white/[0.06] hover:text-white"
        >
          <SquarePen className="size-4 text-white/90" strokeWidth={1.6} />
          New chat
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full justify-start gap-2.5 rounded-lg px-2.5 text-[14px] font-normal text-white/90 hover:bg-white/[0.06] hover:text-white"
        >
          <Library className="size-4" strokeWidth={1.6} />
          Library
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full justify-start gap-2.5 rounded-lg px-2.5 text-[14px] font-normal text-white/90 hover:bg-white/[0.06] hover:text-white"
        >
          <Folder className="size-4" strokeWidth={1.6} />
          Projects
        </Button>
      </div>

      {/* Recents */}
      <div className="scrollbar-thin mt-2 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <button
          type="button"
          onClick={() => setRecentsOpen((v) => !v)}
          className="mb-1 flex w-full items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] text-white/45 hover:text-white/70"
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
            <p className="px-2.5 py-4 text-center text-xs text-white/35">No chats found</p>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((thread) => {
                const active = thread.id === activeId;
                return (
                  <li key={thread.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => onSelect(thread.id)}
                      className={cn(
                        "flex w-full items-center rounded-full px-3 py-2 text-left text-[13.5px] leading-snug",
                        active
                          ? "bg-[#212121] font-medium text-white"
                          : "text-white/85 hover:bg-white/[0.06] hover:text-white",
                      )}
                    >
                      <span className="truncate pr-6">{thread.title}</span>
                    </button>
                    <IconButton
                      label="Chat options"
                      size="icon-xs"
                      className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 opacity-0 group-hover:inline-flex group-hover:opacity-100 hover:bg-white/10"
                    >
                      <MoreHorizontal />
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          ))}
      </div>

      {/* Footer: profile + Upgrade */}
      <div className="shrink-0 p-2">
        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 hover:bg-white/[0.04]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
            FI
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">Foisal Islam</p>
            <p className="truncate text-[11px] text-white/45">Free</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 rounded-full border-white/15 bg-transparent px-3 text-[12px] font-medium text-white hover:bg-white/[0.06] hover:text-white"
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
            "absolute inset-0 bg-black/60 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close sidebar overlay"
          onClick={onToggle}
        />
        <aside
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
      >
        {open ? panel : null}
      </aside>
    </>
  );
}
