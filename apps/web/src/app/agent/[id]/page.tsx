import type { Metadata } from "next";

import { EditorWorkspace } from "@/components/workspace/EditorWorkspace";

type AgentPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Workspace — MrOS",
  description: "Chat, preview, and iterate on your product in MrOS.",
};

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;
  return <EditorWorkspace key={id} agentId={id} />;
}
