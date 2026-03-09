"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  clearInvitationData,
  getPendingWorkspaceId,
} from "@/utils/invitationStorage";
import { useWorkspaceStore } from "@/store/workspaceStore";
import workspaceApi from "@/api/workspaceApi";
import { useSocket } from "@/contexts/SocketContext";
import { useWorkspaceEvents } from "@/hooks/websocket";

export default function WorkspaceIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const workspaceId = params.id as string;
  const { setWorkspace, clearWorkspace, currentWorkspaceId } =
    useWorkspaceStore();
  const { socket, isConnected } = useSocket();
  const hasJoinedRef = useRef(false);
  const { joinWorkspace, leaveWorkspace } = useWorkspaceEvents({
    socket,
    workspaceId: workspaceId,
  });

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

    // Cleanup function to clear workspace state when component unmounts
    return () => {
      clearWorkspace();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    if (socket && isConnected && !hasJoinedRef.current) {
      console.log("🚀 Workspace Layout: Joining workspace room:", workspaceId);
      joinWorkspace();
      hasJoinedRef.current = true;
    }

    // Reset ref and leave workspace when workspace changes or component unmounts
    return () => {
      if (hasJoinedRef.current) {
        console.log("🚪 Workspace Layout: Leaving workspace room:", workspaceId);
        leaveWorkspace();
        hasJoinedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, workspaceId]);

  return <>{children}</>;
}
