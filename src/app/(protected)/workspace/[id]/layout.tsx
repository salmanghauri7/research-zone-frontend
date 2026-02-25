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
  const { joinWorkspace } = useWorkspaceEvents({
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
    debugger;
    if (socket && isConnected && !hasJoinedRef.current) {
      console.log("🚀 Joining workspace room:", workspaceId);
      joinWorkspace();
      hasJoinedRef.current = true;
    }

    // Reset ref when workspace changes
    return () => {
      hasJoinedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, workspaceId]);

  return <>{children}</>;
}
