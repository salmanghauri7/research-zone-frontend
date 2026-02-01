"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  clearInvitationData,
  getPendingWorkspaceId,
} from "@/utils/invitationStorage";

// Lazy load WorkSpace component
const WorkSpace = dynamic(
  () => import("@/components/dashboard/workspace/WorkSpace"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    ),
  },
);

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.id as string;

  useEffect(() => {
    // Clean up invitation data if this is the workspace user was invited to
    const pendingWorkspaceId = getPendingWorkspaceId();

    if (pendingWorkspaceId === workspaceId) {
      clearInvitationData();
    }
  }, [workspaceId]);

  return (
    <div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        }
      >
        <WorkSpace />
      </Suspense>
    </div>
  );
}
