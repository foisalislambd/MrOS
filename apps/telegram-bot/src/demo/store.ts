import { cloneSeedProjects, seedSessions } from "./seed";
import type { DemoMessage, DemoProject, DemoSession, UserState } from "./types";

const users = new Map<number, UserState>();

function createUser(telegramId: number): UserState {
  return {
    telegramId,
    activeSessionId: null,
    awaitingProjectName: false,
    projects: cloneSeedProjects(),
    sessions: seedSessions(),
  };
}

export function getUser(telegramId: number): UserState {
  let user = users.get(telegramId);
  if (!user) {
    user = createUser(telegramId);
    users.set(telegramId, user);
  }
  return user;
}

export function resetUser(telegramId: number): UserState {
  const user = createUser(telegramId);
  users.set(telegramId, user);
  return user;
}

export function titleFromPrompt(text: string) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.slice(0, 42) + (trimmed.length > 42 ? "…" : "");
}

export function createProject(
  telegramId: number,
  name?: string,
): { project: DemoProject; session: DemoSession } {
  const user = getUser(telegramId);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const projectName = (name?.trim() || `Project ${id.slice(0, 8)}`).slice(0, 64);

  const project: DemoProject = {
    id,
    name: projectName,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  const session: DemoSession = {
    id: crypto.randomUUID(),
    title: projectName,
    projectId: project.id,
    group: "today",
    updatedAt: now,
    messages: [],
  };

  user.projects.unshift(project);
  user.sessions.unshift(session);
  user.activeSessionId = session.id;
  user.awaitingProjectName = false;

  return { project, session };
}

export function createSessionFromPrompt(
  telegramId: number,
  prompt: string,
): DemoSession {
  const user = getUser(telegramId);
  const now = new Date().toISOString();
  const session: DemoSession = {
    id: crypto.randomUUID(),
    title: titleFromPrompt(prompt),
    projectId: null,
    group: "today",
    updatedAt: now,
    messages: [
      {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt.trim(),
        createdAt: now,
      },
    ],
  };
  user.sessions.unshift(session);
  user.activeSessionId = session.id;
  return session;
}

export function getSession(
  telegramId: number,
  sessionId: string,
): DemoSession | undefined {
  return getUser(telegramId).sessions.find((s) => s.id === sessionId);
}

export function getProject(
  telegramId: number,
  projectId: string,
): DemoProject | undefined {
  return getUser(telegramId).projects.find((p) => p.id === projectId);
}

export function setActiveSession(telegramId: number, sessionId: string | null) {
  const user = getUser(telegramId);
  user.activeSessionId = sessionId;
}

export function clearAwaitingProjectName(telegramId: number) {
  getUser(telegramId).awaitingProjectName = false;
}

export function appendMessage(
  telegramId: number,
  sessionId: string,
  message: DemoMessage,
): DemoSession | undefined {
  const session = getSession(telegramId, sessionId);
  if (!session) return undefined;
  session.messages.push(message);
  session.updatedAt = message.createdAt;
  session.group = "today";
  return session;
}

export function updateProjectStatus(
  telegramId: number,
  projectId: string,
  status: DemoProject["status"],
) {
  const project = getProject(telegramId, projectId);
  if (!project) return undefined;
  project.status = status;
  project.updatedAt = new Date().toISOString();
  return project;
}

/** Attach a brand-new project to an existing session (keeps chat history). */
export function attachProjectToSession(
  telegramId: number,
  sessionId: string,
  name?: string,
): { project: DemoProject; session: DemoSession } | undefined {
  const session = getSession(telegramId, sessionId);
  if (!session) return undefined;

  // Already linked — return existing project if present
  if (session.projectId) {
    const existing = getProject(telegramId, session.projectId);
    if (existing) return { project: existing, session };
  }

  const user = getUser(telegramId);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const project: DemoProject = {
    id,
    name: (name?.trim() || session.title).slice(0, 64),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  session.projectId = project.id;
  session.updatedAt = now;
  user.projects.unshift(project);
  user.activeSessionId = session.id;
  user.awaitingProjectName = false;

  return { project, session };
}

export function listSessionsGrouped(telegramId: number) {
  const sessions = getUser(telegramId).sessions;
  const groups: Record<DemoSession["group"], DemoSession[]> = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  };
  for (const s of sessions) groups[s.group].push(s);
  return groups;
}
