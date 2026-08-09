import { EditorWorkspace } from "@/components/workspace/EditorWorkspace";

type AgentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;
  return <EditorWorkspace key={id} agentId={id} />;
}
