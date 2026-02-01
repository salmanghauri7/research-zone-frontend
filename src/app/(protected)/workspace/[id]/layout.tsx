"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import {
  clearInvitationData,
  getPendingWorkspaceId,
} from "@/utils/invitationStorage";
import { useWorkspaceStore } from "@/store/workspaceStore";
import workspaceApi from "@/api/workspaceApi";

export default function WorkspaceIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const workspaceId = params.id as string;
  const { setWorkspace, clearWorkspace } = useWorkspaceStore();

  useEffect(() => {
    // Clean up invitation data if this is the workspace user was invited to
    const pendingWorkspaceId = getPendingWorkspaceId();

    if (pendingWorkspaceId === workspaceId) {
      clearInvitationData();
    }

    // Fetch workspace details
    const fetchWorkspaceDetails = async () => {
      try {
        const response = await workspaceApi.checkWorkspaceRole(workspaceId);
        const currentWorkspace = response.data.data || [];

        if (currentWorkspace) {
          setWorkspace(
            workspaceId,
            currentWorkspace.isOwner,
            currentWorkspace.title,
          );
        }
      } catch (error) {
        console.error("Failed to fetch workspace details:", error);
      }
    };

    fetchWorkspaceDetails();

    // Cleanup function to clear workspace state when leaving workspace entirely
    return () => {
      clearWorkspace();
    };
  }, [workspaceId, setWorkspace, clearWorkspace]);

  return <>{children}</>;
}
