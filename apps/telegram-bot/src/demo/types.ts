export type ProjectStatus = "draft" | "building" | "ready" | "failed";

export type DemoProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type DemoMessageRole = "user" | "assistant" | "system";

export type DemoToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: string;
};

export type DemoMessage = {
  id: string;
  role: DemoMessageRole;
  content: string;
  createdAt: string;
  files?: string[];
  tools?: DemoToolCall[];
};

export type DemoSession = {
  id: string;
  title: string;
  projectId: string | null;
  group: "today" | "yesterday" | "week" | "older";
  updatedAt: string;
  messages: DemoMessage[];
};

export type UserState = {
  telegramId: number;
  activeSessionId: string | null;
  awaitingProjectName: boolean;
  projects: DemoProject[];
  sessions: DemoSession[];
};
