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
  isHighlighted?: boolean;
  disableActions?: boolean;
}

export default function ChatMessage({
  message,
  isOwn = false,
  onReply,
  onEdit,
  onDelete,
  onThreadOpen,
  isHighlighted = false,
  disableActions = false,
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
      id={`message-${message.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative flex gap-3 px-6 py-2 transition-colors ${
        isHighlighted
          ? "bg-teal-50 dark:bg-teal-500/10"
          : isHovered
            ? "bg-stone-50/50 dark:bg-white/2"
            : "bg-transparent"
      }
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
            className="w-9 h-9 rounded-lg object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400">
            {getInitials(message.sender.name)}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-semibold text-sm text-stone-800 dark:text-white">
            {message.sender.name}
          </span>
          <span className="text-xs text-stone-400 dark:text-white/35">
            {formatTime(message.timestamp)}
          </span>
          {message.isEdited && !message.isDeleted && (
            <span className="text-xs text-stone-400 dark:text-white/25">
              (edited)
            </span>
          )}
        </div>

        {/* Deleted Message Display */}
        {message.isDeleted ? (
          <div className="flex items-center gap-2 py-1">
            <p className="text-sm italic text-stone-400 dark:text-white/35">
              This message was deleted
            </p>
          </div>
        ) : (
          <>
            {/* Reply Reference */}
            {message.replyTo && (
              <div className="flex items-center gap-2 mb-2 pl-3 py-1.5 border-l-2 rounded-r-md border-teal-400 bg-teal-50/50 dark:border-teal-500/40 dark:bg-teal-500/5">
                <FiCornerUpLeft className="w-3 h-3 text-stone-400 dark:text-white/35" />
                <span className="text-xs font-medium text-stone-600 dark:text-white/60">
                  {message.replyTo.sender.name}
                </span>
                <span className="text-xs truncate text-stone-500 dark:text-white/40">
                  {message.replyTo.content.slice(0, 50)}
                  {message.replyTo.content.length > 50 && "..."}
                </span>
              </div>
            )}

            {/* Message Text */}
            <p className="text-sm leading-relaxed break-words text-stone-700 dark:text-white/85">
              {message.content}
            </p>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.attachments.map((attachment) => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {/* Thread Count */}
            {message.threadCount && message.threadCount > 0 ? (
              <button
                onClick={() => onThreadOpen?.(message)}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                <span>{message.threadCount} replies</span>
              </button>
            ) : null}
          </>
        )}
      </div>

      {/* Message Actions - Shown on hover, but not for deleted messages or when disabled */}
      <AnimatePresence>
        {!disableActions && isHovered && !message.isDeleted && (
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
function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Use localBlobUrl for preview while uploading, then fall back to actual url
  const displayUrl = attachment.localBlobUrl || attachment.url;

  // Don't show skeleton for local blob URLs (they load instantly)
  const showSkeleton =
    attachment.type === "image" && !attachment.localBlobUrl && !isImageLoaded;

  if (attachment.type === "image") {
    return (
      <div className="relative group/img max-w-xs max-h-48 rounded-lg overflow-hidden">
        {/* Skeleton placeholder while image is loading */}
        {showSkeleton && (
          <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 text-stone-400 dark:text-stone-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt={attachment.name}
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover cursor-pointer transition-all ${
            attachment.isUploading ? "blur-sm opacity-70" : "hover:opacity-90"
          } ${showSkeleton ? "opacity-0" : "opacity-100"}`}
          style={{
            minWidth: showSkeleton ? "200px" : undefined,
            minHeight: showSkeleton ? "150px" : undefined,
          }}
        />
        {/* Upload overlay */}
        {attachment.isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-xs font-medium text-white drop-shadow-lg">
                Uploading...
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (attachment.type === "voice") {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-stone-100 dark:bg-white/4">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="h-1 rounded-full bg-stone-300 dark:bg-white/15">
            <div className="h-full w-1/3 rounded-full bg-teal-500 dark:bg-teal-400" />
          </div>
        </div>
        <span className="text-xs text-stone-500 dark:text-white/45">
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
        attachment.isUploading
          ? "bg-stone-100 dark:bg-white/4"
          : "bg-stone-100 hover:bg-stone-200 dark:bg-white/4 dark:hover:bg-white/6"
      }`}
    >
      {attachment.isUploading ? (
        // Show upload spinner instead of file icon when uploading
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-stone-200 dark:bg-white/6">
          <div className="w-5 h-5 border-2 border-stone-400 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : (
        <a
          href={displayUrl}
          download={attachment.name}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-stone-200 dark:bg-white/6"
        >
          <svg
            className="w-5 h-5 text-stone-500 dark:text-white/55"
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
        </a>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-stone-800 dark:text-white">
          {attachment.name}
        </p>
        <div className="flex items-center gap-2">
          {attachment.size && (
            <p className="text-xs text-stone-500 dark:text-white/40">
              {formatFileSize(attachment.size)}
            </p>
          )}
          {attachment.isUploading && (
            <p className="text-xs text-teal-600 dark:text-teal-400">
              Uploading...
            </p>
          )}
        </div>
      </div>
      {!attachment.isUploading && (
        <a
          href={displayUrl}
          download={attachment.name}
          className="p-2 rounded-lg hover:bg-stone-300 dark:hover:bg-white/6 transition-colors"
        >
          <svg
            className="w-4 h-4 text-stone-500 dark:text-white/55"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </a>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
