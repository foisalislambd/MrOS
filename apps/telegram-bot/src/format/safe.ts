/** Escape user-controlled text for Telegram Rich Markdown (inline contexts). */
export function escapeRichInline(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "'")
    .replace(/\*/g, "∗")
    .replace(/_/g, "＿")
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/\|/g, "¦")
    .replace(/</g, "‹")
    .replace(/>/g, "›");
}

/** Flatten multiline user prompts for blockquotes / single-line display. */
export function flattenPrompt(text: string, max = 500) {
  const flat = text.trim().replace(/\s+/g, " ");
  const safe = escapeRichInline(flat);
  return safe.length > max ? `${safe.slice(0, max - 1)}…` : safe;
}

/** Telegram deep-link start payloads: A-Z a-z 0-9 _ - only, max 64. */
export function toStartPayload(sessionId: string) {
  const raw = `s_${sessionId}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 64);
  return raw;
}

export function fromStartPayload(payload: string): string | null {
  if (!payload.startsWith("s_")) return null;
  const id = payload.slice(2);
  return id || null;
}
