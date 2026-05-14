"use client";

import { useParams, useSearchParams } from "next/navigation";
import { SavedPapersContent } from "@/modules/workspace/saved-papers";

export default function SavedPapersPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceId = params.id as string;
  const highlightedPaperId = searchParams.get("highlightPaper");

  return (
    <SavedPapersContent
      workspaceId={workspaceId}
      highlightedPaperId={highlightedPaperId}
    />
  );
}
