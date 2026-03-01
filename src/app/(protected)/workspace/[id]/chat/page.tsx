"use client";

import {
  useState,
  useCallback,
  useMemo,
  Suspense,
  useEffect,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import { Message, User } from "@/components/chat";
import { useUserStore } from "@/store/userStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useSocket } from "@/contexts/SocketContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useChatEvents } from "@/hooks/websocket/useChatEvents";
import { useWorkspaceEvents } from "@/hooks/websocket/useWorkspaceEvents";
import { AttachmentPayload } from "@/hooks/websocket/types";
import { chatApi, BackendMessage } from "@/api/chatApi";
import DeleteConfirmModal from "@/components/chat/DeleteConfirmModal";
import SearchChat from "@/components/chat/SearchChat";
import SearchResultsPanel from "@/components/chat/SearchResultsPanel";

// Lazy load the heavy ChatContainer component
const ChatContainer = dynamic(() => import("@/components/chat/ChatContainer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-stone-200 border-t-teal-500 dark:border-stone-700 dark:border-t-teal-400 rounded-full animate-spin" />
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
    isDeleted: backendMsg.isDeleted || false,
    threadCount: backendMsg.replyCount || 0,
    parentMessageId: backendMsg.parentMessageId || null,
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
      type: att.mimeType?.startsWith("image/") ? "image" : "file",
      url: att.url,
      name: att.fileName || att.url.split("/").pop() || "attachment",
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
  const workspaceTitle = useWorkspaceStore((state) => state.workspaceTitle);
  const isSearching = useWorkspaceStore((state) => state.isSearching);
  const setIsSearching = useWorkspaceStore((state) => state.setIsSearching);

  // Get socket connection
  const { socket, isConnected } = useSocket();

  // Get notification context
  const { showError } = useNotification();

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
  const [lastFetchedWorkspaceId, setLastFetchedWorkspaceId] = useState<
    string | null
  >(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload state
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  // Refs to track blob URLs for cleanup
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Helper to track new blob URLs
  const trackBlobUrl = useCallback((url: string) => {
    blobUrlsRef.current.add(url);
  }, []);

  // Cleanup blob URLs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up all tracked blob URLs
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  // Handle Ctrl+F / Cmd+F keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+F (Windows/Linux) or Cmd+F (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault(); // Prevent browser's default find
        setIsSearching(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearching]);

  // Handle search - call the backend API
  const handleSearch = useCallback(
    async (query: string) => {
      if (!currentWorkspaceId) return;

      setSearchQuery(query);
      setIsSearchLoading(true);
      setShowSearchResults(true);

      try {
        const response = await chatApi.searchMessages({
          workspaceId: currentWorkspaceId,
          query,
          limit: 10,
          cursor: null,
        });

        // Create a map for quoted message lookups
        const messagesMap = new Map(
          response.results.map((msg) => [msg._id, msg]),
        );

        // Transform backend messages to frontend format
        const transformedResults = response.results.map((msg) =>
          transformBackendMessage(msg, messagesMap),
        );

        setSearchResults(transformedResults);
      } catch (error) {
        console.error("Failed to search messages:", error);
        showError("Failed to search messages. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    },
    [currentWorkspaceId, showError],
  );

  // Close search results panel
  const handleCloseSearchResults = useCallback(() => {
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchQuery("");
  }, []);

  // Handle clicking on a search result - scroll to message (keep panel open)
  const handleMessageClick = useCallback(
    (messageId: string) => {
      // Find the message element and scroll to it
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Highlight the message temporarily
        setHighlightedMessageId(messageId);
        setTimeout(() => {
          setHighlightedMessageId(null);
        }, 2000); // Remove highlight after 2 seconds
      } else {
        // Message not loaded in current view
        showError(
          "This message is not currently loaded. Try loading more messages.",
        );
      }
    },
    [showError],
  );

  // Fetch initial messages
  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (!currentWorkspaceId) {
        console.log("🚫 No workspace ID, skipping fetch");
        return;
      }

      // Prevent duplicate fetches for the same workspace
      if (currentWorkspaceId === lastFetchedWorkspaceId) {
        console.log("⏭️ Already fetched for this workspace, skipping");
        return;
      }

      try {
        setIsLoading(true);
        setLastFetchedWorkspaceId(currentWorkspaceId);
        const response = await chatApi.fetchMessages({
          workspaceId: currentWorkspaceId,
          limit: 20,
          cursor: null,
        });
        console.log(response, "these are the messages");

        // Create a map of all messages for quoted message lookup
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

      // Mark message as deleted in main messages
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, isDeleted: true } : msg,
        ),
      );

      // Mark message as deleted in thread replies
      setThreadReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((threadId) => {
          updated[threadId] = updated[threadId].map((msg) =>
            msg.id === data.messageId ? { ...msg, isDeleted: true } : msg,
          );
        });
        return updated;
      });
    };

    const handleMessageDeletionCompleted = (data: { messageId: string }) => {
      console.log("Message deletion confirmed:", data.messageId);
      // Mark as deleted (confirmation)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, isDeleted: true } : msg,
        ),
      );

      setThreadReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((threadId) => {
          updated[threadId] = updated[threadId].map((msg) =>
            msg.id === data.messageId ? { ...msg, isDeleted: true } : msg,
          );
        });
        return updated;
      });
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
    (parentId: string, receivedMessage: Message) => {
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
            ? { ...msg, threadCount: (msg.threadCount || 0) + 1 }
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
  const handleMessageReceived = useCallback(
    (messageData: any) => {
      console.log("📨 Received message in chat page:", messageData);

      // Transform received message to frontend format
      const receivedMessage: Message = {
        id: messageData._id || messageData.id, // Backend uses _id
        content: messageData.content,
        sender: {
          id: messageData.sender._id || messageData.sender.id,
          name: `${messageData.sender.firstName}${messageData.sender.username ? ` (${messageData.sender.username})` : ""}`,
          avatar: messageData.sender.avatar,
        },
        timestamp: new Date(messageData.createdAt),
        isEdited: messageData.isEdited,
        threadCount: messageData.replyCount || 0,
        attachments: messageData.attachments?.map(
          (att: any, index: number) => ({
            id: `${messageData._id || messageData.id}-att-${index}`,
            type: att.mimeType?.startsWith("image/") ? "image" : "file",
            url: att.url,
            name: att.fileName || att.url.split("/").pop() || "attachment",
          }),
        ),
      };

      // Handle quoted message (replyTo) if quotedMessageId exists
      if (messageData.quotedMessageId) {
        // Look up the quoted message from existing messages
        const quotedMessage = messages.find(
          (msg) => msg.id === messageData.quotedMessageId,
        );
        if (quotedMessage) {
          receivedMessage.replyTo = {
            id: quotedMessage.id,
            content: quotedMessage.content,
            sender: quotedMessage.sender,
            timestamp: quotedMessage.timestamp,
          };
        }
      }

      // Check if this is a thread reply (has parentMessageId)
      if (messageData.parentMessageId) {
        handleThreadReply(messageData.parentMessageId, receivedMessage);
      } else {
        handleMainMessage(receivedMessage, messageData._id || messageData.id);
      }
    },
    [handleThreadReply, handleMainMessage, messages],
  );

  // Initialize workspace events hook and join workspace room

  // Join workspace room when socket connects or workspace changes

  // Handle message sent confirmation - replace optimistic message with real one
  const handleMessageSent = useCallback(
    (messageData: any) => {
      console.log("✅ Message sent confirmation:", messageData);

      // Check if this is a thread reply (has parentMessageId)
      if (messageData.parentMessageId) {
        // Replace optimistic thread reply with real one, preserving localBlobUrl
        setThreadReplies((prev) => {
          const parentId = messageData.parentMessageId;
          const currentReplies = prev[parentId] || [];

          // Find and replace the optimistic message
          const updatedReplies = currentReplies.map((msg) => {
            // Match by temporary ID pattern and content
            if (
              msg.id.startsWith("reply-") &&
              msg.content === messageData.content &&
              msg.sender.id ===
                (messageData.sender._id || messageData.sender.id)
            ) {
              // Build real message, preserving localBlobUrls from optimistic message
              const realMessage: Message = {
                id: messageData._id || messageData.id,
                content: messageData.content,
                sender: {
                  id: messageData.sender._id || messageData.sender.id,
                  name: `${messageData.sender.firstName}${messageData.sender.username ? ` (${messageData.sender.username})` : ""}`,
                  avatar: messageData.sender.avatar,
                },
                timestamp: new Date(messageData.createdAt),
                isEdited: messageData.isEdited,
                threadCount: messageData.replyCount || 0,
                attachments: messageData.attachments?.map(
                  (att: any, index: number) => ({
                    id: `${messageData._id || messageData.id}-att-${index}`,
                    type: att.mimeType?.startsWith("image/")
                      ? ("image" as const)
                      : ("file" as const),
                    url: att.url,
                    name:
                      att.fileName || att.url.split("/").pop() || "attachment",
                    // Preserve localBlobUrl from optimistic attachment to prevent re-download
                    localBlobUrl: msg.attachments?.[index]?.localBlobUrl,
                    isUploading: false,
                  }),
                ),
              };

              // Handle quoted message lookup
              if (messageData.quotedMessageId) {
                let quotedMessage = messages.find(
                  (m) => m.id === messageData.quotedMessageId,
                );
                if (!quotedMessage) {
                  for (const threadId in prev) {
                    quotedMessage = prev[threadId].find(
                      (m) => m.id === messageData.quotedMessageId,
                    );
                    if (quotedMessage) break;
                  }
                }
                if (quotedMessage) {
                  realMessage.replyTo = {
                    id: quotedMessage.id,
                    content: quotedMessage.content,
                    sender: quotedMessage.sender,
                    timestamp: quotedMessage.timestamp,
                  };
                }
              }

              return realMessage;
            }
            return msg;
          });

          return { ...prev, [parentId]: updatedReplies };
        });
      } else {
        // Replace optimistic main message with real one, preserving localBlobUrl
        setMessages((prev) => {
          return prev.map((msg) => {
            // Match by temporary ID pattern and content
            if (
              msg.id.startsWith("msg-") &&
              msg.content === messageData.content &&
              msg.sender.id ===
                (messageData.sender._id || messageData.sender.id)
            ) {
              // Build real message, preserving localBlobUrls from optimistic message
              const realMessage: Message = {
                id: messageData._id || messageData.id,
                content: messageData.content,
                sender: {
                  id: messageData.sender._id || messageData.sender.id,
                  name: `${messageData.sender.firstName}${messageData.sender.username ? ` (${messageData.sender.username})` : ""}`,
                  avatar: messageData.sender.avatar,
                },
                timestamp: new Date(messageData.createdAt),
                isEdited: messageData.isEdited,
                threadCount: messageData.replyCount || 0,
                attachments: messageData.attachments?.map(
                  (att: any, index: number) => ({
                    id: `${messageData._id || messageData.id}-att-${index}`,
                    type: att.mimeType?.startsWith("image/")
                      ? ("image" as const)
                      : ("file" as const),
                    url: att.url,
                    name:
                      att.fileName || att.url.split("/").pop() || "attachment",
                    // Preserve localBlobUrl from optimistic attachment to prevent re-download
                    localBlobUrl: msg.attachments?.[index]?.localBlobUrl,
                    isUploading: false,
                  }),
                ),
              };

              // Handle quoted message lookup
              if (messageData.quotedMessageId) {
                let quotedMessage = prev.find(
                  (m) => m.id === messageData.quotedMessageId,
                );
                if (!quotedMessage) {
                  for (const threadId in threadReplies) {
                    quotedMessage = threadReplies[threadId].find(
                      (m) => m.id === messageData.quotedMessageId,
                    );
                    if (quotedMessage) break;
                  }
                }
                if (quotedMessage) {
                  realMessage.replyTo = {
                    id: quotedMessage.id,
                    content: quotedMessage.content,
                    sender: quotedMessage.sender,
                    timestamp: quotedMessage.timestamp,
                  };
                }
              }

              return realMessage;
            }
            return msg;
          });
        });
      }
    },
    [messages, threadReplies],
  );

  // Handle message deleted from useChatEvents hook
  const handleMessageDeleted = useCallback(
    (data: { messageId: string; workspaceId: string }) => {
      console.log("🗑️ Marking message as deleted in UI:", data.messageId);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === data.messageId ? { ...msg, isDeleted: true } : msg,
        ),
      );

      // Also mark as deleted in threads if it exists there
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
    [],
  );

  // Initialize chat events hook
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

  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[], replyTo?: Message) => {
      try {
        // Generate a unique message ID for optimistic update
        const optimisticId = `msg-${Date.now()}`;

        // Determine message type based on attachments
        let messageType: "text" | "file" | "image" = "text";

        // Create optimistic attachments with blob URLs for immediate preview
        let optimisticAttachments: Message["attachments"];
        if (attachments && attachments.length > 0) {
          const allImages = attachments.every((file) =>
            file.type.startsWith("image/"),
          );
          messageType = allImages ? "image" : "file";

          optimisticAttachments = attachments.map((file, index) => {
            const blobUrl = URL.createObjectURL(file);
            trackBlobUrl(blobUrl); // Track for cleanup on unmount
            return {
              id: `att-${optimisticId}-${index}`,
              type: file.type.startsWith("image/")
                ? ("image" as const)
                : ("file" as const),
              url: "", // Will be filled after upload
              localBlobUrl: blobUrl,
              name: file.name,
              size: file.size,
              isUploading: true, // Mark as uploading
            };
          });
        }

        // Optimistic UI update - add message to local state IMMEDIATELY
        const newMessage: Message = {
          id: optimisticId,
          content,
          sender: currentUser,
          timestamp: new Date(),
          replyTo: replyTo,
          attachments: optimisticAttachments,
        };

        setMessages((prev) => [...prev, newMessage]);

        // Now upload attachments in the background if they exist
        let attachmentPayload: AttachmentPayload[] | undefined;
        if (attachments && attachments.length > 0 && currentWorkspaceId) {
          setIsUploadingAttachments(true);

          try {
            // Upload files to S3 and get URLs back
            const uploadedAttachments = await chatApi.uploadAttachments(
              currentWorkspaceId,
              attachments,
            );

            // Check if upload was successful and returned data
            if (!uploadedAttachments || uploadedAttachments.length === 0) {
              throw new Error("No attachments were uploaded");
            }

            // Convert uploaded attachments to AttachmentPayload format
            attachmentPayload = uploadedAttachments.map((att) => ({
              url: att.url,
              fileName: att.fileName,
              fileKey: att.fileKey,
              fileSize: att.fileSize,
              mimeType: att.mimeType,
            }));

            // Update optimistic message with real URLs (keep blob URLs for display)
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id === optimisticId && msg.attachments) {
                  return {
                    ...msg,
                    attachments: msg.attachments.map((att, index) => ({
                      ...att,
                      url: uploadedAttachments[index]?.url || att.url,
                      isUploading: false, // Mark upload as complete
                      // Keep localBlobUrl for display until server confirms
                    })),
                  };
                }
                return msg;
              }),
            );
          } catch (error) {
            console.error("Failed to upload attachments:", error);
            showError("Failed to upload files. Please try again.");
            // Remove the optimistic message on failure
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== optimisticId),
            );
            // Clean up blob URLs
            optimisticAttachments?.forEach((att) => {
              if (att.localBlobUrl) {
                URL.revokeObjectURL(att.localBlobUrl);
              }
            });
            setIsUploadingAttachments(false);
            return;
          } finally {
            setIsUploadingAttachments(false);
          }
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
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [
      currentUser,
      user?.id,
      currentWorkspaceId,
      isConnected,
      sendMessageViaSocket,
      showError,
      trackBlobUrl,
    ],
  );

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      // Optimistic UI update
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

      // Emit edit-message event via WebSocket
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

    // Optimistic UI update - instantly mark as deleted
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageToDelete ? { ...msg, isDeleted: true } : msg,
      ),
    );
    // Also mark as deleted in thread replies
    setThreadReplies((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((threadId) => {
        updated[threadId] = updated[threadId].map((msg) =>
          msg.id === messageToDelete ? { ...msg, isDeleted: true } : msg,
        );
      });
      return updated;
    });

    // Send delete request via WebSocket using the hook
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
        // Generate a unique reply ID for optimistic update
        const optimisticId = `reply-${Date.now()}`;

        // Determine message type based on attachments
        let messageType: "text" | "file" | "image" = "text";

        // Create optimistic attachments with blob URLs for immediate preview
        let optimisticAttachments: Message["attachments"];
        if (attachments && attachments.length > 0) {
          const allImages = attachments.every((file) =>
            file.type.startsWith("image/"),
          );
          messageType = allImages ? "image" : "file";

          optimisticAttachments = attachments.map((file, index) => {
            const blobUrl = URL.createObjectURL(file);
            trackBlobUrl(blobUrl); // Track for cleanup on unmount
            return {
              id: `att-${optimisticId}-${index}`,
              type: file.type.startsWith("image/")
                ? ("image" as const)
                : ("file" as const),
              url: "", // Will be filled after upload
              localBlobUrl: blobUrl,
              name: file.name,
              size: file.size,
              isUploading: true, // Mark as uploading
            };
          });
        }

        // Optimistic UI update IMMEDIATELY
        const newReply: Message = {
          id: optimisticId,
          content,
          sender: currentUser,
          timestamp: new Date(),
          replyTo: replyTo, // Include replyTo in optimistic message
          attachments: optimisticAttachments,
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

        // Now upload attachments in the background if they exist
        let attachmentPayload: AttachmentPayload[] | undefined;
        if (attachments && attachments.length > 0 && currentWorkspaceId) {
          setIsUploadingAttachments(true);

          try {
            // Upload files to S3 and get URLs back
            const uploadedAttachments = await chatApi.uploadAttachments(
              currentWorkspaceId,
              attachments,
            );

            // Check if upload was successful and returned data
            if (!uploadedAttachments || uploadedAttachments.length === 0) {
              throw new Error("No attachments were uploaded");
            }

            // Convert uploaded attachments to AttachmentPayload format
            attachmentPayload = uploadedAttachments.map((att) => ({
              url: att.url,
              fileName: att.fileName,
              fileKey: att.fileKey,
              fileSize: att.fileSize,
              mimeType: att.mimeType,
            }));

            // Update optimistic reply with real URLs
            setThreadReplies((prev) => {
              const updatedReplies = { ...prev };
              if (updatedReplies[parentId]) {
                updatedReplies[parentId] = updatedReplies[parentId].map(
                  (msg) => {
                    if (msg.id === optimisticId && msg.attachments) {
                      return {
                        ...msg,
                        attachments: msg.attachments.map((att, index) => ({
                          ...att,
                          url: uploadedAttachments[index]?.url || att.url,
                          isUploading: false, // Mark upload as complete
                        })),
                      };
                    }
                    return msg;
                  },
                );
              }
              return updatedReplies;
            });
          } catch (error) {
            console.error("Failed to upload attachments:", error);
            showError("Failed to upload files. Please try again.");
            // Remove the optimistic reply on failure
            setThreadReplies((prev) => ({
              ...prev,
              [parentId]: (prev[parentId] || []).filter(
                (msg) => msg.id !== optimisticId,
              ),
            }));
            // Decrement thread count
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === parentId
                  ? {
                      ...msg,
                      threadCount: Math.max((msg.threadCount || 1) - 1, 0),
                    }
                  : msg,
              ),
            );
            // Clean up blob URLs
            optimisticAttachments?.forEach((att) => {
              if (att.localBlobUrl) {
                URL.revokeObjectURL(att.localBlobUrl);
              }
            });
            setIsUploadingAttachments(false);
            return;
          } finally {
            setIsUploadingAttachments(false);
          }
        }

        // Send via WebSocket with parentMessageId for thread replies
        if (isConnected && user?.id && currentWorkspaceId) {
          sendMessageViaSocket({
            content,
            messageType,
            attachments: attachmentPayload,
            parentMessageId: parentId, // This makes it a thread reply
            quotedMessageId: replyTo?.id, // Include quoted message if replying to a specific message
          });
        }
      } catch (error) {
        console.error("Error sending thread reply:", error);
      }
    },
    [
      currentUser,
      user?.id,
      currentWorkspaceId,
      isConnected,
      sendMessageViaSocket,
      showError,
      trackBlobUrl,
    ],
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-teal-500 dark:border-stone-700 dark:border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white dark:bg-stone-950">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search Chat Component */}
        {isSearching && (
          <SearchChat
            workspaceTitle={workspaceTitle || undefined}
            onSearch={handleSearch}
          />
        )}

        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-stone-200 border-t-teal-500 dark:border-stone-700 dark:border-t-teal-400 rounded-full animate-spin" />
            </div>
          }
        >
          {/* Load More Button */}
          {hasMore && (
            <div className="p-3 text-center border-b border-stone-200 dark:border-white/6">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-4 py-1.5 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            workspaceId={currentWorkspaceId || undefined}
            isUploadingAttachments={isUploadingAttachments}
            highlightedMessageId={highlightedMessageId}
          />
        </Suspense>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={cancelDeleteMessage}
          onConfirm={confirmDeleteMessage}
          isDeleting={isDeleting}
        />
      </div>

      {/* Search Results Panel */}
      <SearchResultsPanel
        isOpen={showSearchResults}
        onClose={handleCloseSearchResults}
        searchQuery={searchQuery}
        results={searchResults}
        isLoading={isSearchLoading}
        workspaceTitle={workspaceTitle || undefined}
        onMessageClick={handleMessageClick}
      />
    </div>
  );
}
