"use client";

import { useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";

type FileNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
};

const FILE_CONTENTS: Record<string, string> = {
  "src/App.tsx": `export default function App() {
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
}`,
  "src/index.css": `:root {
  --accent: #ff6b4a;
  --bg: #121214;
  --fg: #ffffff;
  --muted: #9b9b98;
}

.flux-shell {
  min-height: 100%;
  background: var(--bg);
  color: var(--fg);
}

@media (max-width: 420px) {
  .flux-shell {
    padding: 12px;
  }
}`,
  "src/components/SpendChart.tsx": `const BARS = [42, 68, 35, 80, 55, 72, 48];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function SpendChart() {
  return (
    <section className="spend-chart">
      <div className="header">
        <h2>Weekly spend</h2>
        <span>vs last week −8%</span>
      </div>
      <div className="bars">
        {BARS.map((height, i) => (
          <div key={DAYS[i] + i} className="bar-col">
            <div className="bar" style={{ height: \`\${height}%\` }} />
            <span>{DAYS[i]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}`,
  "src/components/Transactions.tsx": `const TRANSACTIONS = [
  { name: "Blue Bottle", cat: "Coffee", amount: "-$6.40" },
  { name: "Metro Transit", cat: "Travel", amount: "-$2.75" },
  { name: "Payroll", cat: "Income", amount: "+$2,400" },
  { name: "Grocery Market", cat: "Food", amount: "-$54.20" },
];

export function Transactions() {
  return (
    <section>
      <h2>Recent</h2>
      <ul>
        {TRANSACTIONS.map((tx) => (
          <li key={tx.name}>
            <div>
              <p>{tx.name}</p>
              <p>{tx.cat}</p>
            </div>
            <span>{tx.amount}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}`,
  "package.json": `{
  "name": "flux",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`,
};

const FILE_TREE: FileNode[] = [
  {
    name: "src",
    path: "src",
    type: "folder",
    children: [
      { name: "App.tsx", path: "src/App.tsx", type: "file" },
      { name: "index.css", path: "src/index.css", type: "file" },
      {
        name: "components",
        path: "src/components",
        type: "folder",
        children: [
          {
            name: "SpendChart.tsx",
            path: "src/components/SpendChart.tsx",
            type: "file",
          },
          {
            name: "Transactions.tsx",
            path: "src/components/Transactions.tsx",
            type: "file",
          },
        ],
      },
    ],
  },
  { name: "package.json", path: "package.json", type: "file" },
];

function FileTreeItem({
  node,
  depth,
  activePath,
  openFolders,
  onToggleFolder,
  onSelectFile,
}: {
  node: FileNode;
  depth: number;
  activePath: string;
  openFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onSelectFile: (path: string) => void;
}) {
  const isOpen = openFolders.has(node.path);
  const isActive = activePath === node.path;
  const pad = 8 + depth * 12;

  if (node.type === "folder") {
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggleFolder(node.path)}
          className="flex w-full items-center gap-1.5 py-1 pr-2 text-left text-[12px] text-white/80 hover:bg-white/[0.05] hover:text-white"
          style={{ paddingLeft: pad }}
        >
          {isOpen ? (
            <ChevronDown className="size-3.5 shrink-0 text-white/50" strokeWidth={1.6} />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-white/50" strokeWidth={1.6} />
          )}
          {isOpen ? (
            <FolderOpen className="size-3.5 shrink-0 text-accent" strokeWidth={1.6} />
          ) : (
            <Folder className="size-3.5 shrink-0 text-accent" strokeWidth={1.6} />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen &&
          node.children?.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              openFolders={openFolders}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectFile(node.path)}
      className={cn(
        "flex w-full items-center gap-1.5 py-1 pr-2 text-left text-[12px] hover:bg-white/[0.05]",
        isActive ? "bg-white/[0.08] text-white" : "text-white/75 hover:text-white",
      )}
      style={{ paddingLeft: pad + 16 }}
    >
      <FileCode2 className="size-3.5 shrink-0 text-white/55" strokeWidth={1.6} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function CodeExplorer() {
  const [activePath, setActivePath] = useState("src/App.tsx");
  const [openTabs, setOpenTabs] = useState<string[]>(["src/App.tsx"]);
  const [openFolders, setOpenFolders] = useState<Set<string>>(
    () => new Set(["src", "src/components"]),
  );
  const [explorerOpen, setExplorerOpen] = useState(true);

  const content = FILE_CONTENTS[activePath] ?? "// File not found";
  const lines = useMemo(() => content.split("\n"), [content]);
  const fileName = activePath.split("/").pop() ?? activePath;

  function selectFile(path: string) {
    setActivePath(path);
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
  }

  function closeTab(path: string, e: MouseEvent) {
    e.stopPropagation();
    setOpenTabs((prev) => {
      const next = prev.filter((p) => p !== path);
      if (path === activePath) {
        setActivePath(next[next.length - 1] ?? Object.keys(FILE_CONTENTS)[0]);
      }
      return next;
    });
  }

  function toggleFolder(path: string) {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <div className="flex h-full w-full min-h-0 bg-preview-chrome">
      {/* File explorer */}
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-[#0c0c0e] transition-[width] duration-200",
          explorerOpen ? "w-[200px] sm:w-[220px]" : "w-0 overflow-hidden border-r-0",
        )}
      >
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
          <span className="text-[10px] font-semibold tracking-wider text-white/50 uppercase">
            Explorer
          </span>
          <span className="text-[10px] text-white/35">flux</span>
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto py-1">
          <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wide text-white/40 uppercase">
            Files
          </p>
          {FILE_TREE.map((node) => (
            <FileTreeItem
              key={node.path}
              node={node}
              depth={0}
              activePath={activePath}
              openFolders={openFolders}
              onToggleFolder={toggleFolder}
              onSelectFile={selectFile}
            />
          ))}
        </div>
      </aside>

      {/* Editor pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-9 shrink-0 items-center border-b border-border bg-[#101012]">
          <button
            type="button"
            onClick={() => setExplorerOpen((v) => !v)}
            className="flex h-full items-center border-r border-border px-2.5 text-white/70 hover:bg-white/[0.05] hover:text-white"
            aria-label="Toggle explorer"
            title="Toggle explorer"
          >
            <Folder className="size-3.5" strokeWidth={1.6} />
          </button>

          <div className="scrollbar-thin flex min-w-0 flex-1 items-stretch overflow-x-auto">
            {openTabs.map((path) => {
              const name = path.split("/").pop() ?? path;
              const active = path === activePath;
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => setActivePath(path)}
                  className={cn(
                    "group flex h-9 shrink-0 items-center gap-2 border-r border-border px-3 text-[12px]",
                    active
                      ? "bg-preview-chrome text-white"
                      : "bg-transparent text-white/55 hover:bg-white/[0.04] hover:text-white/85",
                  )}
                >
                  <FileCode2 className="size-3 shrink-0 text-white/50" strokeWidth={1.6} />
                  <span>{name}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => closeTab(path, e)}
                    onKeyDown={(e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenTabs((prev) => {
                          const next = prev.filter((p) => p !== path);
                          if (path === activePath) {
                            setActivePath(
                              next[next.length - 1] ?? Object.keys(FILE_CONTENTS)[0],
                            );
                          }
                          return next;
                        });
                      }
                    }}
                    className={cn(
                      "ml-0.5 rounded px-0.5 text-[11px] text-white/40 hover:bg-white/10 hover:text-white",
                      active ? "opacity-70" : "opacity-0 group-hover:opacity-70",
                    )}
                    aria-label={`Close ${name}`}
                  >
                    ×
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden shrink-0 items-center gap-2 px-3 text-[11px] text-white/40 sm:flex">
            <span className="truncate">{fileName}</span>
          </div>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-auto">
          <div className="flex min-w-full font-mono text-[12px] leading-6 sm:text-[12.5px]">
            <div
              aria-hidden
              className="sticky left-0 select-none border-r border-border/60 bg-preview-chrome py-3 pr-3 pl-3 text-right text-white/30"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="flex-1 whitespace-pre py-3 pr-4 pl-4 text-[#e8e4de]">
              {content}
            </pre>
          </div>
        </div>

        <div className="flex h-7 shrink-0 items-center justify-between border-t border-border bg-[#0c0c0e] px-3 text-[10px] text-white/40">
          <span>{activePath}</span>
          <span>UTF-8 · TypeScript React</span>
        </div>
      </div>
    </div>
  );
}
