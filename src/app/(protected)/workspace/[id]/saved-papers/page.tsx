"use client";

import { useParams } from "next/navigation";
import { SavedPapersContent } from "@/modules/workspace/saved-papers";

export default function SavedPapersPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  return <SavedPapersContent workspaceId={workspaceId} />;
}
