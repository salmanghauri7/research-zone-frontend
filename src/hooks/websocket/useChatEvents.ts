"use client";

import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { useNotification } from "@/contexts/NotificationContext";

interface MessageData {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

interface UseChatEventsProps {
  socket: Socket | null;
  chatId: string;
  onMessageReceived?: (message: MessageData) => void;
  onTyping?: (userId: string) => void;
  onStopTyping?: (userId: string) => void;
}

export const useChatEvents = ({
  socket,
  chatId,
  onMessageReceived,
  onTyping,
  onStopTyping,
}: UseChatEventsProps) => {
  const { showSuccess, showError } = useNotification();

  // Handle new message
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: MessageData) => {
      console.log("💬 New message:", data);
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

  // Send message
  const sendMessage = (content: string) => {
    if (!socket) {
      showError("Not connected to chat");
      return;
    }

    socket.emit("send-message", { chatId, content });
  };

  // Send typing indicator
  const startTyping = () => {
    if (!socket) return;
    socket.emit("start-typing", { chatId });
  };

  const stopTyping = () => {
    if (!socket) return;
    socket.emit("stop-typing", { chatId });
  };

  return {
    sendMessage,
    startTyping,
    stopTyping,
  };
};
