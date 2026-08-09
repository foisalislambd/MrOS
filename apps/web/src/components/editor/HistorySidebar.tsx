"use client";

import {
  IconDots,
  IconLibrary,
  IconLogo,
  IconPenNew,
  IconProjects,
  IconSearch,
  IconSettings,
  IconSidebar,
} from "./icons";

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

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-border bg-[#ece9e4] transition-[width] duration-300 ease-out ${
        open ? "w-[260px]" : "w-0 overflow-hidden border-r-0"
      }`}
      aria-hidden={!open}
    >
      <div className="flex h-12 shrink-0 items-center gap-1 px-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition hover:bg-black/5 hover:text-fg"
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <IconSidebar className="h-4 w-4" />
        </button>
        <div className="ml-0.5 flex min-w-0 items-center gap-2">
          <IconLogo className="h-5 w-5 shrink-0 text-accent" />
          <span className="truncate text-sm font-semibold tracking-tight">MrOS</span>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition hover:bg-black/5 hover:text-fg"
          aria-label="New chat"
          title="New chat"
        >
          <IconPenNew className="h-4 w-4" />
        </button>
      </div>

      <div className="px-2.5 pb-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-2.5 rounded-xl bg-bg-elevated px-3 py-2.5 text-sm font-medium text-fg shadow-[var(--shadow-soft)] ring-1 ring-border transition hover:bg-white"
        >
          <IconPenNew className="h-4 w-4 text-accent" />
          New chat
        </button>
      </div>

      <div className="px-2.5 pb-2">
        <label className="flex items-center gap-2 rounded-xl bg-black/[0.04] px-2.5 py-2 ring-1 ring-transparent transition focus-within:bg-bg-elevated focus-within:ring-border">
          <IconSearch className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats"
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
        </label>
      </div>

      <nav className="px-2.5 pb-2">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fg-muted transition hover:bg-black/5 hover:text-fg"
        >
          <IconLibrary className="h-4 w-4" />
          Library
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fg-muted transition hover:bg-black/5 hover:text-fg"
        >
          <IconProjects className="h-4 w-4" />
          Projects
        </button>
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
                        className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left text-[13px] leading-snug transition ${
                          active
                            ? "bg-bg-elevated font-medium text-fg shadow-sm ring-1 ring-border"
                            : "text-fg-muted hover:bg-black/5 hover:text-fg"
                        }`}
                      >
                        <span className="truncate pr-6">{thread.title}</span>
                      </button>
                      <button
                        type="button"
                        className="absolute top-1/2 right-1.5 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle opacity-0 transition group-hover:flex group-hover:opacity-100 hover:bg-black/5 hover:text-fg"
                        aria-label="Chat options"
                      >
                        <IconDots className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-border/80 p-2.5">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-black/5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fg text-[11px] font-semibold text-bg-elevated">
            IF
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Ifois</p>
            <p className="truncate text-[11px] text-fg-subtle">Free plan</p>
          </div>
          <IconSettings className="h-4 w-4 shrink-0 text-fg-subtle" />
        </button>
      </div>
    </aside>
  );
}
