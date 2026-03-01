"use client";

import { useState, useRef, useEffect } from "react";
import { Message, User } from "./types";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import ThreadPanel from "./ThreadPanel";
import { getTypingText } from "./typingHelper";
import { useSocket } from "@/contexts/SocketContext";
import { useChatEvents } from "@/hooks/websocket/useChatEvents";

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
    replyTo?: Message,
  ) => void;
  threadReplies?: Record<string, Message[]>;
  workspaceId?: string;
  isUploadingAttachments?: boolean;
  highlightedMessageId?: string | null;
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
  workspaceId,
  isUploadingAttachments = false,
  highlightedMessageId = null,
}: ChatContainerProps) {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [activeThread, setActiveThread] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Get socket connection
  const { socket } = useSocket();

  // Handle typing events through useChatEvents hook
  const { handleTyping, stopTyping } = useChatEvents({
    socket,
    workspaceId: workspaceId || "",
    onTyping: (username) => {
      setTypingUsers((prev) =>
        prev.includes(username) ? prev : [...prev, username],
      );
    },
    onStopTyping: (username) => {
      setTypingUsers((prev) => prev.filter((name) => name !== username));
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // THE KILL SWITCH: Remove sender from typingUsers when new message arrives
  // This ensures instant hiding of typing indicator when message is sent
  useEffect(() => {
    if (messages.length === 0) return;

    // Get the most recent message
    const latestMessage = messages[messages.length - 1];
    const senderName = latestMessage.sender.name;

    // If this sender was typing, remove them immediately
    setTypingUsers((prev) => {
      if (prev.includes(senderName)) {
        return prev.filter((name) => name !== senderName);
      }
      return prev;
    });
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

  const handleSendThreadReply = (
    content: string,
    attachments?: File[],
    replyTo?: Message,
  ) => {
    if (activeThread) {
      onSendThreadReply(activeThread.id, content, attachments, replyTo);
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
                    <div className="flex-1 h-px bg-stone-200 dark:bg-white/6" />
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-stone-100 text-stone-500 dark:bg-white/4 dark:text-white/40">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-stone-200 dark:bg-white/6" />
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
                      isHighlighted={highlightedMessageId === message.id}
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
          typingStatusText={getTypingText(typingUsers)}
          onTyping={handleTyping}
          onStopTyping={stopTyping}
          disabled={isUploadingAttachments}
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
      <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 bg-teal-50 dark:bg-teal-500/10">
        <svg
          className="w-8 h-8 text-teal-600 dark:text-teal-400"
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
      <h3 className="text-lg font-semibold mb-1.5 text-stone-800 dark:text-white">
        Start the conversation
      </h3>
      <p className="text-center max-w-sm text-sm text-stone-500 dark:text-white/45">
        Send a message to begin collaborating with your team.
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
