import type { PendingAgent } from "./types";

const PENDING_KEY = "mros:pending-agent";

/** Survives React Strict Mode remounts after sessionStorage was cleared. */
const consumedById = new Map<string, PendingAgent>();

export function setPendingAgent(payload: PendingAgent) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function consumePendingAgent(id: string): PendingAgent | null {
  const cached = consumedById.get(id);
  if (cached) return cached;

  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PendingAgent;
    if (data.id !== id) return null;
    sessionStorage.removeItem(PENDING_KEY);
    consumedById.set(id, data);
    return data;
  } catch {
    return null;
  }
}
