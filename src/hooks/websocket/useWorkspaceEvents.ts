"use client";

import { useEffect, useCallback, useRef } from "react";
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
  const hasJoinedRef = useRef<string | null>(null);

  // Join workspace
  const joinWorkspace = useCallback(() => {
    if (socket && workspaceId) {
      // Prevent re-joining the same workspace
      if (hasJoinedRef.current === workspaceId) {
        console.log("⏭️ Already joined workspace:", workspaceId);
        return;
      }

      // If joining a different workspace, emit leave for the old one first
      if (hasJoinedRef.current && hasJoinedRef.current !== workspaceId) {
        console.log("🚪 Leaving previous workspace:", hasJoinedRef.current);
        socket.emit("leave-workspace", { workspaceId: hasJoinedRef.current });
      }

      socket.emit("join-workspace", { workspaceId });
      hasJoinedRef.current = workspaceId;
    }
  }, [socket, workspaceId]);

  // Handle joined-workspace event
  useEffect(() => {
    if (!socket) return;

    const handleJoinedWorkspace = (data: JoinedWorkspaceData) => {
      console.log("✅ Successfully joined workspace:", data);
      onWorkspaceJoined?.(data);
    };

    const handleJoinError = (error: JoinWorkspaceErrorData) => {
      console.error("❌ Failed to join workspace:", error);
      showError(error.message || "Failed to join workspace");
      // Reset ref on error so user can retry
      hasJoinedRef.current = null;
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
      onUserJoined?.(data);
    };

    socket.on("user-joined-workspace", handleUserJoined);

    return () => {
      socket.off("user-joined-workspace", handleUserJoined);
    };
  }, [socket, showInfo, onUserJoined]);

  // Cleanup: leave workspace when component unmounts
  useEffect(() => {
    return () => {
      if (socket && hasJoinedRef.current) {
        console.log(
          "🚪 Component unmounting, leaving workspace:",
          hasJoinedRef.current,
        );
        socket.emit("leave-workspace", { workspaceId: hasJoinedRef.current });
        hasJoinedRef.current = null;
      }
    };
  }, [socket]);

  return {
    joinWorkspace,
  };
};
