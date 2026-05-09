"use client";

import { useState, useCallback } from "react";
import { Message } from "../types";
import { chatApi, BackendMessage } from "../apis/chatApi";
import { transformBackendMessage } from "../utils/transformMessage";

interface UseChatSearchProps {
  showError: (message: string) => void;
  currentWorkspaceId: string | null;
}

export const useChatSearch = ({
  showError,
  currentWorkspaceId,
}: UseChatSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  // use shared transform helper

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

  return {
    searchQuery,
    searchResults,
    isSearchLoading,
    showSearchResults,
    highlightedMessageId,
    handleSearch,
    handleCloseSearchResults,
    handleMessageClick,
  };
};
