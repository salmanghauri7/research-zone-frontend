"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "./types";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";
import { FiX } from "react-icons/fi";

interface ThreadPanelProps {
  parentMessage: Message | null;
  replies: Message[];
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (content: string, attachments?: File[]) => void;
  onEditMessage?: (message: Message) => void;
  onDeleteMessage?: (messageId: string) => void;
  currentUserId?: string;
}

export default function ThreadPanel({
  parentMessage,
  replies,
  isOpen,
  onClose,
  onSendReply,
  onEditMessage,
  onDeleteMessage,
  currentUserId,
}: ThreadPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [replies, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && parentMessage && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Thread Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 lg:w-[420px] z-50 lg:z-auto lg:relative lg:h-auto flex flex-col border-l bg-white border-gray-200 dark:bg-[#0a0a0a] dark:border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-white/10">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Thread
                </h3>
                <p className="text-xs text-gray-500 dark:text-white/50">
                  {replies.length} {replies.length === 1 ? "reply" : "replies"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-700 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Parent Message */}
            <div className="border-b border-gray-200 dark:border-white/10">
              <ChatMessage
                message={parentMessage}
                isOwn={parentMessage.sender.id === currentUserId}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
              />
            </div>

            {/* Replies */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-3 text-gray-400 dark:text-white/40">
                <span className="text-xs font-medium uppercase tracking-wider">
                  {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                </span>
              </div>

              {replies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-100 dark:bg-white/5">
                    <svg
                      className="w-8 h-8 text-gray-400 dark:text-white/30"
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
                  <p className="text-sm text-center text-gray-500 dark:text-white/50">
                    No replies yet.
                    <br />
                    Be the first to reply!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-transparent">
                  {replies.map((reply) => (
                    <ChatMessage
                      key={reply.id}
                      message={reply}
                      isOwn={reply.sender.id === currentUserId}
                      onEdit={onEditMessage}
                      onDelete={onDeleteMessage}
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <MessageInput
              onSend={onSendReply}
              placeholder="Reply in thread..."
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
