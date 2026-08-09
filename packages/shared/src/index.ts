export type ProjectStatus = "draft" | "building" | "ready" | "failed";

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  projectId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type TelegramCommand =
  | { type: "status" }
  | { type: "list_projects" }
  | { type: "list_sessions" }
  | { type: "create_project"; name?: string }
  | { type: "open_session"; sessionId: string }
  | { type: "open_project"; projectId: string }
  | { type: "run"; projectId?: string; sessionId?: string; prompt: string };

/** Session summary shaped for Telegram / API sync later. */
export type TelegramSessionSummary = {
  id: string;
  title: string;
  projectId: string | null;
  updatedAt: string;
};

export const APP_NAME = "MrOS";
