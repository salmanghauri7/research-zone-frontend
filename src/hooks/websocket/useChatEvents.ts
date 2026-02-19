"use client";

import { useEffect, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import { useNotification } from "@/contexts/NotificationContext";
import { SendMessagePayload, MessageData, AttachmentPayload } from "./types";

interface UseChatEventsProps {
  socket: Socket | null;
  workspaceId: string;
  onMessageReceived?: (message: MessageData) => void;
  onMessageSent?: (message: MessageData) => void;
  onMessageDeleted?: (data: { messageId: string; workspaceId: string }) => void;
  onTyping?: (username: string) => void;
  onStopTyping?: (username: string) => void;
}

export const useChatEvents = ({
  socket,
  workspaceId,
  onMessageReceived,
  onMessageSent,
  onMessageDeleted,
  onTyping,
  onStopTyping,
}: UseChatEventsProps) => {
  const { showError } = useNotification();
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle message sent confirmation (to replace optimistic message with real ID)
  useEffect(() => {
    if (!socket) return;

    const handleMessageSent = (data: MessageData) => {
      console.log("✅ Message sent confirmation received:", data);
      onMessageSent?.(data);
    };

    socket.on("message-sent", handleMessageSent);
    return () => {
      socket.off("message-sent", handleMessageSent);
    };
  }, [socket, onMessageSent]);

  // Handle message deleted (broadcast to all users in workspace)
  useEffect(() => {
    if (!socket) return;

    const handleMessageDeleted = (data: {
      messageId: string;
      workspaceId: string;
    }) => {
      console.log("🗑️ Message deleted event received:", data);
      onMessageDeleted?.(data);
    };

    const handleMessageDeletionCompleted = (data: {
      messageId: string;
      workspaceId: string;
    }) => {
      console.log("✅ Message deletion completed:", data);
      onMessageDeleted?.(data);
    };

    socket.on("message-deleted", handleMessageDeleted);
    socket.on("message-deletion-completed", handleMessageDeletionCompleted);

    return () => {
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("message-deletion-completed", handleMessageDeletionCompleted);
    };
  }, [socket, onMessageDeleted]);

  // Handle typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: { username: string }) => {
      onTyping?.(data.username);
    };

    const handleStopTyping = (data: { username: string }) => {
      onStopTyping?.(data.username);
    };

    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
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

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!socket) {
        showError("Not connected to chat");
        return;
      }

      if (!content.trim()) {
        showError("Message cannot be empty");
        return;
      }

      console.log("✏️ Editing message:", { messageId, content });
      socket.emit("edit-message", {
        workspaceId,
        messageId,
        content: content.trim(),
      });
    },
    [socket, workspaceId, showError],
  );

  // Debounced typing handler
  const handleTyping = useCallback(() => {
    if (!socket) return;

    // Only emit 'typing' if we haven't already told the server we are typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { workspaceId });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit("stop_typing", { workspaceId });
        isTypingRef.current = false;
      }
    }, 2000);
  }, [socket, workspaceId]);

  // Manual typing control (for advanced use cases)
  const startTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("typing", { workspaceId });
    isTypingRef.current = true;
  }, [socket, workspaceId]);

  const stopTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("stop_typing", { workspaceId });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    isTypingRef.current = false;
  }, [socket, workspaceId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    sendMessage,
    handleTyping,
    startTyping,
    stopTyping,
    deleteMessage,
    editMessage,
  };
};
