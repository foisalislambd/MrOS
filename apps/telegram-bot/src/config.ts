import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import { APP_NAME } from "@mros/shared";

/**
 * Turbo/bun runs this package from `apps/telegram-bot`, so root `.env`
 * is not auto-loaded. Pull it in when TELEGRAM_BOT_TOKEN is still missing.
 */
function loadRootEnv() {
  if (process.env.TELEGRAM_BOT_TOKEN?.trim()) return;

  const candidates = [
    resolve(import.meta.dir, "../../../.env"),
    resolve(process.cwd(), "../../.env"),
    resolve(process.cwd(), ".env"),
  ];

  for (const path of candidates) {
    if (!existsSync(path)) continue;
    try {
      const parsed = parseEnv(readFileSync(path, "utf8"));
      for (const [key, value] of Object.entries(parsed)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
      if (process.env.TELEGRAM_BOT_TOKEN?.trim()) return;
    } catch {
      /* try next candidate */
    }
  }
}

function parseAllowedIds(raw: string | undefined): Set<number> | null {
  if (!raw?.trim()) return null;
  const ids = raw
    .split(/[,\s]+/)
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  return ids.length ? new Set(ids) : null;
}

loadRootEnv();

export const config = {
  appName: APP_NAME,
  token: process.env.TELEGRAM_BOT_TOKEN?.trim() || "",
  allowedUserIds: parseAllowedIds(process.env.TELEGRAM_ALLOWED_USER_IDS),
  /** Demo mode: in-memory store, fake agent stream. Swap for API later. */
  demo: true,
} as const;
