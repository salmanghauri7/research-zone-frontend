"use client";

import { useCallback } from "react";
import { useChatEvents } from "./useChatEvents";
import { Message } from "../types";
import { ChatSocketMessageData, UseChatSocketHandlersProps } from "./types";
import { BackendMessage } from "../apis/chatApi";
import { transformBackendMessage } from "../utils/transformMessage";

const toBackendMessage = (
  messageData: ChatSocketMessageData,
): BackendMessage => ({
  _id: messageData._id || messageData.id || "",
  clientId: (messageData as any).clientId,
  workspaceId: "",
  sender: {
    _id: messageData.sender._id || messageData.sender.id || "",
    firstName: messageData.sender.firstName,
    avatar: messageData.sender.avatar,
  },
  content: messageData.content,
  isEdited: messageData.isEdited,
  replyCount: messageData.replyCount,
  quotedMessageId: messageData.quotedMessageId,
  parentMessageId: messageData.parentMessageId,
  attachments: messageData.attachments?.map((att) => ({
    url: att.url,
    fileName: att.fileName,
    mimeType: att.mimeType,
  })),
  createdAt: messageData.createdAt,
  updatedAt: messageData.createdAt,
  messageType: messageData.attachments?.some((att) =>
    att.mimeType?.startsWith("image/"),
  )
    ? "image"
    : "text",
});

const buildQuotedMessagesMap = (messages: Message[]) =>
  new Map<string, BackendMessage>(
    messages.map((msg) => [
      msg.id,
      {
        _id: msg.id,
        workspaceId: "",
        sender: {
          _id: msg.sender.id,
          firstName: msg.sender.name,
          avatar: msg.sender.avatar,
        },
        content: msg.content,
        isEdited: msg.isEdited,
        isDeleted: msg.isDeleted,
        replyCount: msg.threadCount,
        quotedMessageId: msg.replyTo?.id,
        parentMessageId: msg.parentMessageId,
        attachments: msg.attachments?.map((att) => ({
          url: att.url,
          fileName: att.name,
          mimeType:
            att.type === "image" ? "image/*" : "application/octet-stream",
        })),
        createdAt: msg.timestamp.toISOString(),
        updatedAt: msg.timestamp.toISOString(),
        messageType: msg.attachments?.some((att) => att.type === "image")
          ? "image"
          : "text",
      },
    ]),
  );

export const useChatSocketHandlers = ({
  socket,
  currentWorkspaceId,
  messages,
  setMessages,
  setThreadReplies,
}: UseChatSocketHandlersProps) => {
  const handleThreadReply = useCallback(
    (parentId: string, receivedMessage: Message) => {
      setThreadReplies((prev) => {
        const currentReplies = prev[parentId] || [];

        const optimisticIndex = currentReplies.findIndex(
          (msg) =>
            msg.sender.id === receivedMessage.sender.id &&
            msg.content === receivedMessage.content &&
            Math.abs(
              msg.timestamp.getTime() - receivedMessage.timestamp.getTime(),
            ) < 5000,
        );

        if (optimisticIndex !== -1) {
          const updatedReplies = [...currentReplies];
          updatedReplies[optimisticIndex] = receivedMessage;
          return { ...prev, [parentId]: updatedReplies };
        }

        return {
          ...prev,
          [parentId]: [...currentReplies, receivedMessage],
        };
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === parentId
            ? { ...msg, threadCount: (msg.threadCount || 0) + 1 }
            : msg,
        ),
      );
    },
    [setMessages, setThreadReplies],
  );

  const handleMainMessage = useCallback(
    (receivedMessage: Message, messageId: string) => {
      setMessages((prev) => {
        const optimisticIndex = prev.findIndex(
          (msg) =>
            msg.sender.id === receivedMessage.sender.id &&
            msg.content === receivedMessage.content &&
            Math.abs(
              msg.timestamp.getTime() - receivedMessage.timestamp.getTime(),
            ) < 5000,
        );

        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = receivedMessage;
          return updated;
        }

        const exists = prev.some((msg) => msg.id === messageId);
        if (exists) {
          return prev.map((msg) =>
            msg.id === messageId ? receivedMessage : msg,
          );
        }

        return [...prev, receivedMessage];
      });
    },
    [setMessages],
  );

  const handleMessageReceived = useCallback(
    (messageData: ChatSocketMessageData) => {
      const receivedMessage = transformBackendMessage(
        toBackendMessage(messageData),
        buildQuotedMessagesMap(messages),
      );

      if (messageData.parentMessageId) {
        handleThreadReply(messageData.parentMessageId, receivedMessage);
      } else {
        handleMainMessage(
          receivedMessage,
          messageData._id || messageData.id || "",
        );
      }
    },
    [handleMainMessage, handleThreadReply, messages],
  );

  const handleMessageSent = useCallback(
    (messageData: ChatSocketMessageData) => {
      // Prefer a simple clientId match: update optimistic message with server id
      const clientId = (messageData as any).clientId;

      // Ignore thread replies for this iteration
      if (messageData.parentMessageId) return;

      if (!clientId) return;

      const backendMsg = toBackendMessage(messageData);
      const normalized = transformBackendMessage(
        backendMsg,
        buildQuotedMessagesMap(messages),
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.clientId === clientId
            ? {
                ...msg,
                ...normalized,
                id: normalized.id,
                clientId: clientId,
              }
            : msg,
        ),
      );
    },
    [setMessages, setThreadReplies, messages],
  );

  const handleMessageDeleted = useCallback(
    (data: { messageId: string; workspaceId: string }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === data.messageId ? { ...msg, isDeleted: true } : msg,
        ),
      );

      setThreadReplies((prevThreads) => {
        const updatedThreads = { ...prevThreads };
        Object.keys(updatedThreads).forEach((threadId) => {
          updatedThreads[threadId] = updatedThreads[threadId].map((msg) =>
            msg.id === data.messageId ? { ...msg, isDeleted: true } : msg,
          );
        });
        return updatedThreads;
      });
    },
    [setMessages, setThreadReplies],
  );

  const {
    sendMessage: sendMessageViaSocket,
    deleteMessage: deleteMessageViaSocket,
    editMessage: editMessageViaSocket,
  } = useChatEvents({
    socket,
    workspaceId: currentWorkspaceId || "",
    onMessageReceived: handleMessageReceived,
    onMessageSent: handleMessageSent,
    onMessageDeleted: handleMessageDeleted,
  });

  return {
    sendMessageViaSocket,
    deleteMessageViaSocket,
    editMessageViaSocket,
  };
};
