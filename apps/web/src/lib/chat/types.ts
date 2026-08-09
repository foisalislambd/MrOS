export type ChatThread = {
  id: string;
  title: string;
  group: "today" | "yesterday" | "week" | "older";
};

export type Role = "user" | "assistant";

export type Message = {
  id: string;
  role: Role;
  content: string;
  files?: string[];
};

export type PendingAgent = {
  id: string;
  prompt: string;
};
