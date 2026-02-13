"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { Message, User } from "@/components/chat";
import { useUserStore } from "@/store/userStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useSocket } from "@/contexts/SocketContext";
import { useChatEvents } from "@/hooks/websocket/useChatEvents";
import { AttachmentPayload } from "@/hooks/websocket/types";
import { chatApi, BackendMessage } from "@/api/chatApi";

// Lazy load the heavy ChatContainer component
const ChatContainer = dynamic(() => import("@/components/chat/ChatContainer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  ),
});

// Helper function to transform backend messages to frontend format
const transformBackendMessage = (
  backendMsg: BackendMessage,
  quotedMessagesMap: Map<string, BackendMessage>,
): Message => {
  const message: Message = {
    id: backendMsg._id,
    content: backendMsg.content,
    sender: {
      id: backendMsg.sender._id,
      name: `${backendMsg.sender.firstName}${backendMsg.sender.lastName ? " " + backendMsg.sender.lastName : ""}`,
      avatar: backendMsg.sender.avatar,
    },
    timestamp: new Date(backendMsg.createdAt),
    isEdited: backendMsg.isEdited,
    threadCount: backendMsg.replyCount || 0,
  };

  // Handle quoted message (reply in main chat)
  if (
    backendMsg.quotedMessageId &&
    quotedMessagesMap.has(backendMsg.quotedMessageId)
  ) {
    const quotedMsg = quotedMessagesMap.get(backendMsg.quotedMessageId)!;
    message.replyTo = {
      id: quotedMsg._id,
      content: quotedMsg.content,
      sender: {
        id: quotedMsg.sender._id,
        name: `${quotedMsg.sender.firstName}${quotedMsg.sender.lastName ? " " + quotedMsg.sender.lastName : ""}`,
        avatar: quotedMsg.sender.avatar,
      },
      timestamp: new Date(quotedMsg.createdAt),
    };
  }

  // Handle attachments
  if (backendMsg.attachments && backendMsg.attachments.length > 0) {
    message.attachments = backendMsg.attachments.map((att, index) => ({
      id: `${backendMsg._id}-att-${index}`,
      type: backendMsg.messageType === "image" ? "image" : "file",
      url: att.url,
      name: att.url.split("/").pop() || "attachment",
    }));
  }

  return message;
};

export default function ChatPage() {
  // Get user data from store
  const user = useUserStore((state) => state.user);
  const currentWorkspaceId = useWorkspaceStore(
    (state) => state.currentWorkspaceId,
  );

  // Get socket connection
  const { socket, isConnected } = useSocket();

  // Create currentUser object from store data with fallback
  const currentUser: User = useMemo(
    () => ({
      id: user?.id || "user-1",
      name: user?.firstName || "Guest User",
      avatar: undefined,
      isOnline: true,
    }),
    [user],
  );

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadReplies, setThreadReplies] = useState<Record<string, Message[]>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Fetch initial messages
  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (!currentWorkspaceId) return;

      try {
        setIsLoading(true);
        const response = await chatApi.fetchMessages({
          workspaceId: currentWorkspaceId,
          limit: 20,
          cursor: null,
        });

        console.log(response);

        // Create a map of all messages for quoted message lookup
        const messagesMap = new Map(
          response.messages.map((msg) => [msg._id, msg]),
        );

        console.log(messagesMap);

        // Separate main messages and thread replies
        const mainMessages = response.messages.filter(
          (msg) => !msg.parentMessageId,
        );
        const threadMessages = response.messages.filter(
          (msg) => msg.parentMessageId,
        );

        // Transform main messages to frontend format
        const transformedMessages = mainMessages
          .map((msg) => transformBackendMessage(msg, messagesMap))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort chronologically (oldest first)

        // Group thread replies by parent message ID
        const threadRepliesMap: Record<string, Message[]> = {};
        threadMessages.forEach((msg) => {
          const parentId = msg.parentMessageId!;
          if (!threadRepliesMap[parentId]) {
            threadRepliesMap[parentId] = [];
          }
          threadRepliesMap[parentId].push(
            transformBackendMessage(msg, messagesMap),
          );
        });

        // Sort each thread's replies chronologically
        Object.keys(threadRepliesMap).forEach((parentId) => {
          threadRepliesMap[parentId].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
          );
        });

        setMessages(transformedMessages);
        setThreadReplies(threadRepliesMap);
        setCursor(response.cursor);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialMessages();
  }, [currentWorkspaceId]);

  // Load more messages (pagination)
  const handleLoadMore = useCallback(async () => {
    if (!currentWorkspaceId || !hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const response = await chatApi.fetchMessages({
        workspaceId: currentWorkspaceId,
        limit: 50,
        cursor,
      });

      const messagesMap = new Map(
        response.messages.map((msg) => [msg._id, msg]),
      );

      // Separate main messages and thread replies
      const mainMessages = response.messages.filter(
        (msg) => !msg.parentMessageId,
      );
      const threadMessages = response.messages.filter(
        (msg) => msg.parentMessageId,
      );

      const transformedMessages = mainMessages
        .map((msg) => transformBackendMessage(msg, messagesMap))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort chronologically (oldest first)

      // Group thread replies by parent message ID
      const threadRepliesMap: Record<string, Message[]> = {};
      threadMessages.forEach((msg) => {
        const parentId = msg.parentMessageId!;
        if (!threadRepliesMap[parentId]) {
          threadRepliesMap[parentId] = [];
        }
        threadRepliesMap[parentId].push(
          transformBackendMessage(msg, messagesMap),
        );
      });

      // Sort each thread's replies chronologically
      Object.keys(threadRepliesMap).forEach((parentId) => {
        threadRepliesMap[parentId].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
        );
      });

      // Prepend older messages
      setMessages((prev) => [...transformedMessages, ...prev]);

      // Merge thread replies with existing ones
      setThreadReplies((prev) => {
        const merged = { ...prev };
        Object.keys(threadRepliesMap).forEach((parentId) => {
          merged[parentId] = [
            ...threadRepliesMap[parentId],
            ...(prev[parentId] || []),
          ];
        });
        return merged;
      });

      setCursor(response.cursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentWorkspaceId, cursor, hasMore, isLoadingMore]);

  // Listen for message deletion events from other users
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessageDeleted = (data: { messageId: string }) => {
      console.log("Message deleted by another user:", data.messageId);

      // Remove from main messages
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));

      // Remove from thread replies
      setThreadReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((threadId) => {
          updated[threadId] = updated[threadId].filter(
            (msg) => msg.id !== data.messageId,
          );
        });
        return updated;
      });
    };

    const handleMessageDeletionCompleted = (data: { messageId: string }) => {
      console.log("Message deletion confirmed:", data.messageId);
      // Optimistic update already handled, this is just confirmation
    };

    // Listen for deletions from other users
    socket.on("message-deleted", handleMessageDeleted);
    // Listen for own deletion confirmation
    socket.on("message-deletion-completed", handleMessageDeletionCompleted);

    return () => {
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("message-deletion-completed", handleMessageDeletionCompleted);
    };
  }, [socket, isConnected]);

 

  // Handle thread reply messages
  const handleThreadReply = useCallback(
    (parentId: string, receivedMessage: Message, replyCount?: number) => {
      setThreadReplies((prev) => {
        const currentReplies = prev[parentId] || [];

        // Check if this is replacing an optimistic message
        const optimisticIndex = currentReplies.findIndex(
          (msg) =>
            msg.sender.id === receivedMessage.sender.id &&
            msg.content === receivedMessage.content &&
            Math.abs(
              msg.timestamp.getTime() - receivedMessage.timestamp.getTime(),
            ) < 5000,
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic message with real one
          const updatedReplies = [...currentReplies];
          updatedReplies[optimisticIndex] = receivedMessage;
          return { ...prev, [parentId]: updatedReplies };
        }

        // Otherwise, add as new reply
        return {
          ...prev,
          [parentId]: [...currentReplies, receivedMessage],
        };
      });

      // Update thread count on parent message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === parentId
            ? { ...msg, threadCount: replyCount || msg.threadCount || 0 }
            : msg,
        ),
      );
    },
    [],
  );

  // Handle main chat messages (non-thread)
  const handleMainMessage = useCallback(
    (receivedMessage: Message, messageId: string) => {
      setMessages((prev) => {
        // Check if this is replacing an optimistic message
        const optimisticIndex = prev.findIndex(
          (msg) =>
            msg.sender.id === receivedMessage.sender.id &&
            msg.content === receivedMessage.content &&
            Math.abs(
              msg.timestamp.getTime() - receivedMessage.timestamp.getTime(),
            ) < 5000,
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic message with real one
          const updated = [...prev];
          updated[optimisticIndex] = receivedMessage;
          return updated;
        }

        // Check if message already exists (by ID)
        const exists = prev.some((msg) => msg.id === messageId);
        if (exists) {
          return prev.map((msg) =>
            msg.id === messageId ? receivedMessage : msg,
          );
        }

        // Otherwise, add as new message
        return [...prev, receivedMessage];
      });
    },
    [],
  );

   // Handle incoming messages from WebSocket
  const handleMessageReceived = useCallback((messageData: any) => {
    console.log("Received message:", messageData);

    // Transform received message to frontend format
    const receivedMessage: Message = {
      id: messageData.id,
      content: messageData.content,
      sender: {
        id: messageData.sender._id,
        name: `${messageData.sender.firstName}${messageData.sender.username ? ` (${messageData.sender.username})` : ""}`,
        avatar: undefined,
      },
      timestamp: new Date(messageData.createdAt),
      isEdited: messageData.isEdited,
      threadCount: messageData.replyCount || 0,
      attachments: messageData.attachments?.map((att: any, index: number) => ({
        id: `${messageData.id}-att-${index}`,
        type: messageData.messageType === "image" ? "image" : "file",
        url: att.url,
        name: att.url.split("/").pop() || "attachment",
      })),
    };

    // Check if this is a thread reply (has parentMessageId)
    if (messageData.parentMessageId) {
      handleThreadReply(
        messageData.parentMessageId,
        receivedMessage,
        messageData.replyCount,
      );
    } else {
      handleMainMessage(receivedMessage, messageData.id);
    }
  }, [handleThreadReply, handleMainMessage]);

  // Initialize chat events hook
  const {
    sendMessage: sendMessageViaSocket,
    deleteMessage: deleteMessageViaSocket,
  } = useChatEvents({
    socket,
    workspaceId: currentWorkspaceId || "",
    onMessageReceived: handleMessageReceived,
  });

  const handleSendMessage = useCallback(
    (content: string, attachments?: File[], replyTo?: Message) => {
      // Determine message type based on attachments
      let messageType: "text" | "file" | "image" = "text";
      let attachmentPayload: AttachmentPayload[] | undefined;

      if (attachments && attachments.length > 0) {
        // Check if all attachments are images
        const allImages = attachments.every((file) =>
          file.type.startsWith("image/"),
        );
        messageType = allImages ? "image" : "file";

        // Convert File objects to AttachmentPayload
        // Note: In production, you'd upload these files first and get URLs
        attachmentPayload = attachments.map((file) => ({
          url: URL.createObjectURL(file), // Temporary URL for now
        }));
      }

      // Send via WebSocket
      if (isConnected && user?.id && currentWorkspaceId) {
        sendMessageViaSocket({
          content,
          messageType,
          attachments: attachmentPayload,
          quotedMessageId: replyTo?.id, // Use replyTo as quotedMessage for quote replies
        });
      }

      // Optimistic UI update - add message to local state immediately
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        sender: currentUser,
        timestamp: new Date(),
        replyTo: replyTo,
        attachments: attachments?.map((file, index) => ({
          id: `att-${Date.now()}-${index}`,
          type: file.type.startsWith("image/") ? "image" : "file",
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        })),
      };

      setMessages((prev) => [...prev, newMessage]);
    },
    [
      currentUser,
      user?.id,
      currentWorkspaceId,
      isConnected,
      sendMessageViaSocket,
    ],
  );

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true }
            : msg,
        ),
      );
      // Also update thread replies if the message is in a thread
      setThreadReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((threadId) => {
          updated[threadId] = updated[threadId].map((msg) =>
            msg.id === messageId
              ? { ...msg, content: newContent, isEdited: true }
              : msg,
          );
        });
        return updated;
      });
    },
    [],
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      // Optimistic UI update - instantly remove from state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      // Also delete from thread replies
      setThreadReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((threadId) => {
          updated[threadId] = updated[threadId].filter(
            (msg) => msg.id !== messageId,
          );
        });
        return updated;
      });

      // Send delete request via WebSocket using the hook
      if (isConnected) {
        deleteMessageViaSocket(messageId);
      }
    },
    [isConnected, deleteMessageViaSocket],
  );

  const handleSendThreadReply = useCallback(
    (parentId: string, content: string, attachments?: File[]) => {
      // Determine message type based on attachments
      let messageType: "text" | "file" | "image" = "text";
      let attachmentPayload: AttachmentPayload[] | undefined;

      if (attachments && attachments.length > 0) {
        // Check if all attachments are images
        const allImages = attachments.every((file) =>
          file.type.startsWith("image/"),
        );
        messageType = allImages ? "image" : "file";

        // Convert File objects to AttachmentPayload
        attachmentPayload = attachments.map((file) => ({
          url: URL.createObjectURL(file),
        }));
      }

      // Send via WebSocket with parentMessageId for thread replies
      if (isConnected && user?.id && currentWorkspaceId) {
        sendMessageViaSocket({
          content,
          messageType,
          attachments: attachmentPayload,
          parentMessageId: parentId, // This makes it a thread reply
        });
      }

      // Optimistic UI update
      const newReply: Message = {
        id: `reply-${Date.now()}`,
        content,
        sender: currentUser,
        timestamp: new Date(),
        attachments: attachments?.map((file, index) => ({
          id: `att-${Date.now()}-${index}`,
          type: file.type.startsWith("image/") ? "image" : "file",
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        })),
      };

      setThreadReplies((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), newReply],
      }));

      // Update thread count on parent message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === parentId
            ? { ...msg, threadCount: (msg.threadCount || 0) + 1 }
            : msg,
        ),
      );
    },
    [
      currentUser,
      user?.id,
      currentWorkspaceId,
      isConnected,
      sendMessageViaSocket,
    ],
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        }
      >
        {/* Load More Button */}
        {hasMore && (
          <div className="p-4 text-center border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}
        <ChatContainer
          messages={messages}
          currentUser={currentUser}
          channelName="Research Discussion"
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onSendThreadReply={handleSendThreadReply}
          threadReplies={threadReplies}
        />
      </Suspense>
    </div>
  );
}
