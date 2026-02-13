"use client";

import { useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";
import { useNotification } from "@/contexts/NotificationContext";
import { SendMessagePayload, MessageData, AttachmentPayload } from "./types";

interface UseChatEventsProps {
  socket: Socket | null;
  workspaceId: string;
  onMessageReceived?: (message: MessageData) => void;
  onTyping?: (userId: string) => void;
  onStopTyping?: (userId: string) => void;
}

export const useChatEvents = ({
  socket,
  workspaceId,
  onMessageReceived,
  onTyping,
  onStopTyping,
}: UseChatEventsProps) => {
  const { showError } = useNotification();

  // Handle new message
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: MessageData) => {
      console.log("💬 New message received in useChatEvents:", data);
      console.log("🔍 Socket ID:", socket.id);
      onMessageReceived?.(data);
    };

    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, onMessageReceived]);

  // Handle typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleTyping = (userId: string) => {
      onTyping?.(userId);
    };

    const handleStopTyping = (userId: string) => {
      onStopTyping?.(userId);
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [socket, onTyping, onStopTyping]);

  // Send message with full payload
  const sendMessage = useCallback(
    ({
      content,
      messageType = "text",
      attachments,
      parentMessageId,
      quotedMessageId,
    }: {
      content: string;
      messageType?: "text" | "file" | "image";
      attachments?: AttachmentPayload[];
      parentMessageId?: string;
      quotedMessageId?: string;
    }) => {
      if (!socket) {
        showError("Not connected to chat");
        return;
      }

      // Validate: content can't be empty unless attachments exist
      if (!content.trim() && (!attachments || attachments.length === 0)) {
        showError("Message cannot be empty");
        return;
      }

      const payload: SendMessagePayload = {
        workspaceId,
        content: content.trim(),
        messageType,
        ...(attachments && attachments.length > 0 && { attachments }),
        ...(parentMessageId && { parentMessageId }),
        ...(quotedMessageId && { quotedMessageId }),
      };

      console.log("📤 Sending message:", payload);
      socket.emit("send-message", payload);
    },
    [socket, workspaceId, showError],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!socket) {
        showError("Not connected to chat");
        return;
      }

      console.log("🗑️ Deleting message:", messageId);
      socket.emit("delete-message", {
        workspaceId,
        messageId,
      });
    },
    [socket, workspaceId, showError],
  );

  // Send typing indicator
  const startTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("start-typing", { workspaceId });
  }, [socket, workspaceId]);

  const stopTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("stop-typing", { workspaceId });
  }, [socket, workspaceId]);

  return {
    sendMessage,
    startTyping,
    stopTyping,
    deleteMessage,
  };
};
