"use client";

import { useMemo, useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useUserStore } from "@/store/userStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { ChatContainer } from "./index";
import { DeleteConfirmModal } from "./index";
import { SearchChat } from "./index";
import { SearchResultsPanel } from "./index";
import { useChatMessages } from "../hooks/useChatMessages";
import { useChatSearch } from "../hooks/useChatSearch";
import { useChatActions } from "../hooks/useChatActions";
import { useChatSocketHandlers } from "../hooks/useChatSocketHandlers";
import { User } from "../types";

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
      id: user?.id,
      name: user?.firstName || "Guest User",
      avatar: undefined,
      isOnline: true,
    }),
    [user],
  );

  const {
    messages,
    setMessages,
    threadReplies,
    setThreadReplies,
    isLoading,
    isLoadingMore,
    hasMore,
    handleLoadMore,
  } = useChatMessages(currentWorkspaceId);

  const {
    searchQuery,
    searchResults,
    isSearchLoading,
    showSearchResults,
    highlightedMessageId,
    handleSearch,
    handleCloseSearchResults,
    handleMessageClick,
  } = useChatSearch({
    showError,
    currentWorkspaceId,
  });

  const { sendMessageViaSocket, deleteMessageViaSocket, editMessageViaSocket } =
    useChatSocketHandlers({
      socket,
      currentWorkspaceId,
      messages,
      setMessages,
      setThreadReplies,
    });

  const {
    isUploadingAttachments,
    showDeleteModal,
    isDeleting,
    handleSendMessage,
    handleEditMessage,
    handleDeleteMessage,
    confirmDeleteMessage,
    cancelDeleteMessage,
    handleSendThreadReply,
  } = useChatActions({
    currentWorkspaceId,
    isConnected,
    userId: user?.id,
    showError,
    sendMessageViaSocket,
    deleteMessageViaSocket,
    editMessageViaSocket,
    setMessages,
    setThreadReplies,
    currentUserName: currentUser.name,
  });

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setIsSearching(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearching]);

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
        {isSearching && (
          <SearchChat
            workspaceTitle={workspaceTitle || undefined}
            onSearch={handleSearch}
          />
        )}

        <ChatContainer
          messages={messages}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onSendThreadReply={handleSendThreadReply}
          threadReplies={threadReplies}
          workspaceId={currentWorkspaceId || undefined}
          isUploadingAttachments={isUploadingAttachments}
          highlightedMessageId={highlightedMessageId}
          hasMoreMessages={hasMore}
          isLoadingMoreMessages={isLoadingMore}
          onLoadMoreMessages={handleLoadMore}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={cancelDeleteMessage}
          onConfirm={confirmDeleteMessage}
          isDeleting={isDeleting}
        />
      </div>

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
