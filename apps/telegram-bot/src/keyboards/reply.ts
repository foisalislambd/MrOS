import { Keyboard } from "grammy";

export const BTN = {
  newProject: "🆕 New project",
  sessions: "💬 Chats",
  projects: "📁 Projects",
  status: "⚡ Status",
  help: "❓ Help",
  demoAgent: "⚡️ Try demo",
} as const;

export function mainReplyKeyboard() {
  return new Keyboard()
    .text(BTN.newProject)
    .text(BTN.sessions)
    .row()
    .text(BTN.projects)
    .text(BTN.demoAgent)
    .row()
    .text(BTN.status)
    .text(BTN.help)
    .resized()
    .persistent()
    .placeholder("Describe what to build…");
}
