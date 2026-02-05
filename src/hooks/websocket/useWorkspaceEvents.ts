"use client";

import { useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";
import {
  JoinedWorkspaceData,
  UserJoinedWorkspaceData,
  JoinWorkspaceErrorData,
} from "./types";
import { useNotification } from "@/contexts/NotificationContext";

interface UseWorkspaceEventsProps {
  socket: Socket | null;
  workspaceId: string;
  onWorkspaceJoined?: (data: JoinedWorkspaceData) => void;
  onUserJoined?: (data: UserJoinedWorkspaceData) => void;
  onError?: (error: JoinWorkspaceErrorData) => void;
}

export const useWorkspaceEvents = ({
  socket,
  workspaceId,
  onWorkspaceJoined,
  onUserJoined,
  onError,
}: UseWorkspaceEventsProps) => {
  const { showSuccess, showError, showInfo } = useNotification();

  // Join workspace
  const joinWorkspace = useCallback(() => {
    if (socket && workspaceId) {
      socket.emit("join-workspace", { workspaceId });
      console.log("🚀 Joining workspace:", workspaceId);
    }
  }, [socket, workspaceId]);

  // Handle joined-workspace event
  useEffect(() => {
    if (!socket) return;

    const handleJoinedWorkspace = (data: JoinedWorkspaceData) => {
      console.log("✅ Successfully joined workspace:", data);
      showSuccess(`Joined ${data?.workspace.title}`);
      onWorkspaceJoined?.(data);
    };

    const handleJoinError = (error: JoinWorkspaceErrorData) => {
      console.error("❌ Failed to join workspace:", error);
      showError(error.message || "Failed to join workspace");
      onError?.(error);
    };

    socket.on("joined-workspace", handleJoinedWorkspace);
    socket.on("join-workspace-error", handleJoinError);

    return () => {
      socket.off("joined-workspace", handleJoinedWorkspace);
      socket.off("join-workspace-error", handleJoinError);
    };
  }, [socket, showSuccess, showError, onWorkspaceJoined, onError]);

  // Handle user-joined-workspace event (when other users join)
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = (data: UserJoinedWorkspaceData) => {
      console.log("👤 User joined workspace:", data);
      showInfo(`${data.email} joined the workspace`);
      onUserJoined?.(data);
    };

    socket.on("user-joined-workspace", handleUserJoined);

    return () => {
      socket.off("user-joined-workspace", handleUserJoined);
    };
  }, [socket, showInfo, onUserJoined]);

  return {
    joinWorkspace,
  };
};
