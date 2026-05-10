"use client";

import { useState, useEffect, useCallback } from "react";
import { Message } from "../types";
import { chatApi } from "../apis/chatApi";
import { transformBackendMessage } from "../utils/transformMessage";

export const useChatMessages = (workspaceId: string | null) => {
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

  // Fetch initial messages
  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (!workspaceId) {
        return;
      }

      // Prevent duplicate fetches for the same workspace
      if (workspaceId === lastFetchedWorkspaceId) {
        return;
      }

      try {
        setIsLoading(true);
        setLastFetchedWorkspaceId(workspaceId);
        const response = await chatApi.fetchMessages({
          workspaceId,
          limit: 20,
          cursor: null,
        });

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
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

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
  }, [workspaceId, lastFetchedWorkspaceId]);

  // Load more messages (pagination)
  const handleLoadMore = useCallback(async () => {
    if (!workspaceId || !hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const response = await chatApi.fetchMessages({
        workspaceId,
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
  }, [workspaceId, cursor, hasMore, isLoadingMore]);

  return {
    messages,
    setMessages,
    threadReplies,
    setThreadReplies,
    isLoading,
    isLoadingMore,
    hasMore,
    handleLoadMore,
    transformBackendMessage,
  };
};
