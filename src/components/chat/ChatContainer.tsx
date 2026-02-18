"use client";

import { useState, useRef, useEffect } from "react";
import { Message, User } from "./types";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import ThreadPanel from "./ThreadPanel";
// import EditMessageModal from "./EditMessageModal"; // No longer needed - using inline editing

interface ChatContainerProps {
  messages: Message[];
  currentUser: User;
  channelName?: string;
  onSendMessage: (
    content: string,
    attachments?: File[],
    replyTo?: Message,
  ) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onSendThreadReply: (
    parentId: string,
    content: string,
    attachments?: File[],
  ) => void;
  threadReplies?: Record<string, Message[]>;
}

export default function ChatContainer({
  messages,
  currentUser,
  channelName = "General",
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onSendThreadReply,
  threadReplies = {},
}: ChatContainerProps) {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [activeThread, setActiveThread] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string, attachments?: File[]) => {
    onSendMessage(content, attachments, replyTo || undefined);
    setReplyTo(null);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleSaveEdit = (messageId: string, newContent: string) => {
    onEditMessage(messageId, newContent);
    setEditingMessage(null);
  };

  const handleOpenThread = (message: Message) => {
    setActiveThread(message);
  };

  const handleCloseThread = () => {
    setActiveThread(null);
  };

  const handleSendThreadReply = (content: string, attachments?: File[]) => {
    if (activeThread) {
      onSendThreadReply(activeThread.id, content, attachments);
    }
  };

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex h-full min-h-0">
      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-0 ${
          activeThread ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Chat Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-1 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3"></div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-500 dark:hover:bg-white/10 dark:text-white/60">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-500 dark:hover:bg-white/10 dark:text-white/60">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
        >
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="py-4">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-white/50">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                  </div>

                  {/* Messages */}
                  {msgs.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={message.sender.id === currentUser.id}
                      onReply={handleReply}
                      onEdit={handleEdit}
                      onDelete={onDeleteMessage}
                      onThreadOpen={handleOpenThread}
                    />
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <MessageInput
          onSend={handleSendMessage}
          onEditMessage={handleSaveEdit}
          replyTo={replyTo}
          editingMessage={editingMessage}
          onCancelReply={handleCancelReply}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      {/* Thread Panel */}
      <ThreadPanel
        parentMessage={activeThread}
        replies={activeThread ? threadReplies[activeThread.id] || [] : []}
        isOpen={!!activeThread}
        onClose={handleCloseThread}
        onSendReply={handleSendThreadReply}
        onEditMessage={handleEdit}
        onDeleteMessage={onDeleteMessage}
        currentUserId={currentUser.id}
      />

      {/* Edit Message Modal - Removed, now using inline editing in MessageInput */}
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-blue-50 dark:bg-blue-500/10">
        <svg
          className="w-10 h-10 text-blue-500 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
        Welcome
      </h3>
      <p className="text-center max-w-md text-gray-500 dark:text-white/50">
        This is the beginning of your conversation. Start by sending a message
        to your team.
      </p>
    </div>
  );
}

// Helper function to group messages by date
function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  const groups: Record<string, Message[]> = {};
  const dateToTimestamp: Record<string, number> = {}; // Track timestamps for sorting groups

  messages.forEach((message) => {
    const date = new Date(message.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;

    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else {
      dateKey = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
      dateToTimestamp[dateKey] = date.getTime();
    }
    groups[dateKey].push(message);
  });

  // Sort messages within each group chronologically (oldest first)
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  });

  // Sort groups by their timestamp and rebuild the object in order
  const sortedGroups: Record<string, Message[]> = {};
  Object.keys(groups)
    .sort((a, b) => dateToTimestamp[a] - dateToTimestamp[b])
    .forEach((key) => {
      sortedGroups[key] = groups[key];
    });

  return sortedGroups;
}
