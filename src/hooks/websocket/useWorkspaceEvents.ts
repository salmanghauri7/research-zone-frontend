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
  const hasJoinedChatRef = useRef<string | null>(null);

  // Use refs to store latest values without causing re-renders
  const socketRef = useRef(socket);
  const workspaceIdRef = useRef(workspaceId);

  // Update refs when values change
  useEffect(() => {
    socketRef.current = socket;
    workspaceIdRef.current = workspaceId;
  }, [socket, workspaceId]);

  // Join workspace (general) - Stable callback that won't cause re-renders
  const joinWorkspace = useCallback(() => {
    const currentSocket = socketRef.current;
    const currentWorkspaceId = workspaceIdRef.current;

    if (currentSocket && currentWorkspaceId) {
      // Prevent re-joining the same workspace
      if (hasJoinedRef.current === currentWorkspaceId) {
        console.log("⏭️ Already joined workspace:", currentWorkspaceId);
        return;
      }

      // If joining a different workspace, emit leave for the old one first
      if (hasJoinedRef.current && hasJoinedRef.current !== currentWorkspaceId) {
        console.log("🚪 Leaving previous workspace:", hasJoinedRef.current);
        currentSocket.emit("leave-workspace", { workspaceId: hasJoinedRef.current });
      }

      console.log("🚪 Joining workspace:", currentWorkspaceId);
      currentSocket.emit("join-workspace", { workspaceId: currentWorkspaceId });
      hasJoinedRef.current = currentWorkspaceId;
    }
  }, []); // Empty deps - stable reference

  // Join chat room specifically (for users on chat page) - Stable callback
  const joinChatRoom = useCallback(() => {
    const currentSocket = socketRef.current;
    const currentWorkspaceId = workspaceIdRef.current;

    if (currentSocket && currentWorkspaceId) {
      // Prevent re-joining the same chat room
      if (hasJoinedChatRef.current === currentWorkspaceId) {
        console.log("⏭️ Already joined chat room:", currentWorkspaceId);
        return;
      }

      // Leave previous chat room if switching workspaces
      if (hasJoinedChatRef.current && hasJoinedChatRef.current !== currentWorkspaceId) {
        console.log("🚪 Leaving previous chat room:", hasJoinedChatRef.current);
        currentSocket.emit("leave-chat-room", { workspaceId: hasJoinedChatRef.current });
      }

      console.log("🎯 Joining chat room for:", currentWorkspaceId);
      currentSocket.emit("join-chat-room", { workspaceId: currentWorkspaceId });
      hasJoinedChatRef.current = currentWorkspaceId;
    }
  }, []); // Empty deps - stable reference

  // Leave chat room (when navigating away from chat page) - Stable callback
  const leaveChatRoom = useCallback(() => {
    const currentSocket = socketRef.current;

    if (currentSocket && hasJoinedChatRef.current) {
      console.log("🚪 Leaving chat room:", hasJoinedChatRef.current);
      currentSocket.emit("leave-chat-room", { workspaceId: hasJoinedChatRef.current });
      hasJoinedChatRef.current = null;
    }
  }, []); // Empty deps - stable reference

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
      if (socket && hasJoinedChatRef.current) {
        console.log(
          "🚪 Component unmounting, leaving chat room:",
          hasJoinedChatRef.current,
        );
        socket.emit("leave-chat-room", { workspaceId: hasJoinedChatRef.current });
        hasJoinedChatRef.current = null;
      }

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
    joinChatRoom,
    leaveChatRoom,
  };
};
