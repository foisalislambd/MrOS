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
  | { type: "run"; projectId: string; prompt: string };

export const APP_NAME = "MrOS";
