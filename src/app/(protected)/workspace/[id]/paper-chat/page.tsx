"use client";

import { useParams } from "next/navigation";
import { PaperChatContainer } from "@/components/paper-chat";

export default function PaperChatPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  return <PaperChatContainer workspaceId={workspaceId} />;
}
