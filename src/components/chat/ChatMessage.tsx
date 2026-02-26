"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message, Attachment } from "./types";
import MessageActions from "./MessageActions";
import { FiCornerUpLeft } from "react-icons/fi";
import Image from "next/image";

interface ChatMessageProps {
  message: Message;
  isOwn?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onThreadOpen?: (message: Message) => void;
}

export default function ChatMessage({
  message,
  isOwn = false,
  onReply,
  onEdit,
  onDelete,
  onThreadOpen,
}: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative flex gap-3 px-4 py-2 transition-colors ${
        isHovered ? "bg-gray-50/50 dark:bg-white/2" : "bg-transparent"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {message.sender.avatar ? (
          <Image
            src={message.sender.avatar}
            alt={message.sender.name}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            {getInitials(message.sender.name)}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {message.sender.name}
          </span>
          <span className="text-xs text-gray-400 dark:text-white/40">
            {formatTime(message.timestamp)}
          </span>
          {message.isEdited && !message.isDeleted && (
            <span className="text-xs text-gray-400 dark:text-white/30">
              (edited)
            </span>
          )}
        </div>

        {/* Deleted Message Display */}
        {message.isDeleted ? (
          <div className="flex items-center gap-2 py-1">
            <p className="text-sm italic text-gray-400 dark:text-white/40">
              This message was deleted
            </p>
          </div>
        ) : (
          <>
            {/* Reply Reference */}
            {message.replyTo && (
              <div className="flex items-center gap-2 mb-2 pl-3 py-1.5 border-l-2 rounded-r-md border-blue-400 bg-blue-50/50 dark:border-blue-500/50 dark:bg-white/3">
                <FiCornerUpLeft className="w-3 h-3 text-gray-400 dark:text-white/40" />
                <span className="text-xs font-medium text-gray-600 dark:text-white/60">
                  {message.replyTo.sender.name}
                </span>
                <span className="text-xs truncate text-gray-500 dark:text-white/40">
                  {message.replyTo.content.slice(0, 50)}
                  {message.replyTo.content.length > 50 && "..."}
                </span>
              </div>
            )}

            {/* Message Text */}
            <p className="text-sm leading-relaxed break-all text-gray-700 dark:text-white/90">
              {message.content}
            </p>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.attachments.map((attachment) => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                    isUploading={message.isUploading}
                    progress={message.uploadProgress?.[attachment.id]}
                    error={message.uploadError?.[attachment.id]}
                  />
                ))}
              </div>
            )}

            {/* Upload Status - Show when message is uploading */}

            {/* Thread Count */}
            {message.threadCount && message.threadCount > 0 ? (
              <button
                onClick={() => onThreadOpen?.(message)}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span>{message.threadCount} replies</span>
                <span className="text-gray-400 dark:text-white/30">·</span>
                <span>View thread</span>
              </button>
            ) : null}
          </>
        )}
      </div>

      {/* Message Actions - Shown on hover, but not for deleted messages */}
      <AnimatePresence>
        {isHovered && !message.isDeleted && (
          <MessageActions
            message={message}
            isOwn={isOwn}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onThreadOpen={onThreadOpen}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Attachment Preview Component
function AttachmentPreview({
  attachment,
  isUploading,
  progress,
  error,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  progress?: number;
  error?: string;
}) {
  if (attachment.type === "image") {
    return (
      <div className="relative group/img max-w-xs max-h-48 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${
            isUploading ? "blur-sm opacity-75" : ""
          } ${error ? "border-2 border-red-500" : ""}`}
        />
        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              {progress !== undefined && progress > 0 && (
                <span className="text-xs text-white font-medium">
                  {progress}%
                </span>
              )}
            </div>
          </div>
        )}
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">
              Upload failed
            </div>
          </div>
        )}
      </div>
    );
  }

  if (attachment.type === "voice") {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5">
        <button className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="h-1 rounded-full bg-gray-300 dark:bg-white/20">
            <div className="h-full w-1/3 rounded-full bg-blue-500 dark:bg-blue-400" />
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-white/50">
          {attachment.duration
            ? `${Math.floor(attachment.duration / 60)}:${String(
                attachment.duration % 60,
              ).padStart(2, "0")}`
            : "0:00"}
        </span>
      </div>
    );
  }

  // File attachment
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isUploading || error
          ? "bg-gray-100 dark:bg-white/5"
          : "bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 cursor-pointer"
      } ${error ? "border-2 border-red-500" : ""}`}
      onClick={() => {
        if (!isUploading && !error) {
          window.open(attachment.url, "_blank");
        }
      }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-200 dark:bg-white/10 relative">
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-5 h-5 text-gray-500 dark:text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
          {attachment.name}
        </p>
        <div className="flex items-center gap-2">
          {attachment.size && (
            <p className="text-xs text-gray-500 dark:text-white/40">
              {formatFileSize(attachment.size)}
            </p>
          )}
          {isUploading && progress !== undefined && progress > 0 && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {progress}%
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Upload failed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
