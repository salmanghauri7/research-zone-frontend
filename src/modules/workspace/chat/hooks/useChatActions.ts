"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { Message } from "../types";
import { chatApi } from "../apis/chatApi";

export interface AttachmentPayload {
  url: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
}

interface UseChatActionsProps {
  currentWorkspaceId: string | null;
  isConnected: boolean;
  userId: string | undefined;
  showError: (message: string) => void;
  sendMessageViaSocket: (payload: {
    content: string;
    messageType: "text" | "file" | "image";
    attachments?: AttachmentPayload[];
    parentMessageId?: string;
    quotedMessageId?: string;
    clientId?: string;
  }) => void;
  deleteMessageViaSocket: (messageId: string) => void;
  editMessageViaSocket: (messageId: string, content: string) => void;
  // Optional: optimistic UI helpers
  setMessages?: Dispatch<SetStateAction<Message[]>>;
  setThreadReplies?: Dispatch<SetStateAction<Record<string, Message[]>>>;
  currentUserName?: string | undefined;
}

export const useChatActions = ({
  currentWorkspaceId,
  isConnected,
  userId,
  showError,
  sendMessageViaSocket,
  deleteMessageViaSocket,
  editMessageViaSocket,
  setMessages,
  setThreadReplies,
  currentUserName,
}: UseChatActionsProps) => {
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[], replyTo?: Message) => {
      try {
        let messageType: "text" | "file" | "image" = "text";

        if (attachments && attachments.length > 0) {
          const allImages = attachments.every((file) =>
            file.type.startsWith("image/"),
          );
          messageType = allImages ? "image" : "file";
        }

        // Now upload attachments in the background if they exist
        let attachmentPayload: AttachmentPayload[] | undefined;
        if (attachments && attachments.length > 0 && currentWorkspaceId) {
          setIsUploadingAttachments(true);

          try {
            const uploadedAttachments = await chatApi.uploadAttachments(
              currentWorkspaceId,
              attachments,
            );

            // Check if upload was successful and returned data
            if (!uploadedAttachments || uploadedAttachments.length === 0) {
              throw new Error("Upload returned empty response");
            }

            // Convert uploaded attachments to AttachmentPayload format
            attachmentPayload = uploadedAttachments.map((att) => ({
              url: att.url,
              fileName: att.fileName,
              fileKey: att.fileKey,
              fileSize: att.fileSize,
              mimeType: att.mimeType,
            }));
          } catch (error) {
            console.error("Failed to upload attachments:", error);
            showError("Failed to upload files. Please try again.");
            throw error;
          } finally {
            setIsUploadingAttachments(false);
          }
        }

        // Create clientId, add optimistic message with null server id
        const clientId = `c_${Math.random().toString(36).slice(2, 11)}`;

        if (setMessages && userId) {
          const optimisticMessage: Message = {
            id: null,
            clientId,
            content,
            sender: {
              id: userId,
              name: currentUserName || "You",
              avatar: undefined,
            },
            timestamp: new Date(),
            isEdited: false,
            replyTo: replyTo,
            isDeleted: false,
            threadCount: 0,
            attachments: attachmentPayload
              ? attachmentPayload.map((att, idx) => ({
                  id: `${clientId}-att-${idx}`,
                  type: att.mimeType?.startsWith("image/") ? "image" : "file",
                  url: att.url,
                  name:
                    att.fileName || att.url.split("/").pop() || "attachment",
                }))
              : undefined,
          };

          setMessages((prev) => [...prev, optimisticMessage]);
        }

        // Send via WebSocket including clientId
        if (isConnected && userId && currentWorkspaceId) {
          sendMessageViaSocket({
            content,
            messageType,
            attachments: attachmentPayload,
            quotedMessageId: replyTo?.id || undefined,
            clientId,
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [
      currentWorkspaceId,
      isConnected,
      userId,
      showError,
      sendMessageViaSocket,
      setMessages,
      currentUserName,
    ],
  );

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      if (isConnected) {
        editMessageViaSocket(messageId, newContent);
      }
    },
    [isConnected, editMessageViaSocket],
  );

  const handleDeleteMessage = useCallback((messageId: string) => {
    // Show confirmation modal instead of deleting immediately
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteMessage = useCallback(() => {
    if (!messageToDelete) return;

    setIsDeleting(true);

    // Send delete request via WebSocket
    if (isConnected) {
      deleteMessageViaSocket(messageToDelete);
    }

    // Close modal and reset state
    setShowDeleteModal(false);
    setMessageToDelete(null);
    setIsDeleting(false);
  }, [messageToDelete, isConnected, deleteMessageViaSocket]);

  const cancelDeleteMessage = useCallback(() => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
    setIsDeleting(false);
  }, []);

  const handleSendThreadReply = useCallback(
    async (
      parentId: string,
      content: string,
      attachments?: File[],
      replyTo?: Message,
    ) => {
      try {
        // Determine message type based on attachments
        let messageType: "text" | "file" | "image" = "text";

        if (attachments && attachments.length > 0) {
          const allImages = attachments.every((file) =>
            file.type.startsWith("image/"),
          );
          messageType = allImages ? "image" : "file";
        }

        // Now upload attachments in the background if they exist
        let attachmentPayload: AttachmentPayload[] | undefined;
        if (attachments && attachments.length > 0 && currentWorkspaceId) {
          setIsUploadingAttachments(true);

          try {
            const uploadedAttachments = await chatApi.uploadAttachments(
              currentWorkspaceId,
              attachments,
            );

            if (!uploadedAttachments || uploadedAttachments.length === 0) {
              throw new Error("Upload returned empty response");
            }

            attachmentPayload = uploadedAttachments.map((att) => ({
              url: att.url,
              fileName: att.fileName,
              fileKey: att.fileKey,
              fileSize: att.fileSize,
              mimeType: att.mimeType,
            }));
          } catch (error) {
            console.error("Failed to upload attachments:", error);
            showError("Failed to upload files. Please try again.");
            throw error;
          } finally {
            setIsUploadingAttachments(false);
          }
        }

        // Create clientId, add optimistic thread reply with null server id
        const clientId = `c_${Math.random().toString(36).slice(2, 11)}`;

        if (setThreadReplies && userId) {
          const optimisticMessage: Message = {
            id: null,
            clientId,
            content,
            sender: {
              id: userId,
              name: currentUserName || "You",
              avatar: undefined,
            },
            timestamp: new Date(),
            isEdited: false,
            isDeleted: false,
            threadCount: 0,
            parentMessageId: parentId,
            replyTo: replyTo,
            attachments: attachmentPayload
              ? attachmentPayload.map((att, idx) => ({
                  id: `${clientId}-att-${idx}`,
                  type: att.mimeType?.startsWith("image/") ? "image" : "file",
                  url: att.url,
                  name:
                    att.fileName || att.url.split("/").pop() || "attachment",
                }))
              : undefined,
          };

          setThreadReplies((prev) => ({
            ...prev,
            [parentId]: [...(prev[parentId] || []), optimisticMessage],
          }));
        }

        // Send via WebSocket with parentMessageId and clientId for thread replies
        if (isConnected && userId && currentWorkspaceId) {
          sendMessageViaSocket({
            content,
            messageType,
            attachments: attachmentPayload,
            parentMessageId: parentId,
            quotedMessageId: replyTo?.id || undefined,
            clientId,
          });
        }
      } catch (error) {
        console.error("Error sending thread reply:", error);
      }
    },
    [
      currentWorkspaceId,
      isConnected,
      userId,
      showError,
      sendMessageViaSocket,
      setThreadReplies,
      currentUserName,
    ],
  );

  return {
    isUploadingAttachments,
    showDeleteModal,
    messageToDelete,
    isDeleting,
    handleSendMessage,
    handleEditMessage,
    handleDeleteMessage,
    confirmDeleteMessage,
    cancelDeleteMessage,
    handleSendThreadReply,
  };
};
