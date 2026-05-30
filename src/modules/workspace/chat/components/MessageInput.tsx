"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "../types";
import {
  PaperclipIcon,
  ImageIcon,
  SendIcon,
  X,
  CornerUpLeft,
  AlertCircle,
  Plus,
  Edit3,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  replyTo?: Message | null;
  editingMessage?: Message | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  disabled?: boolean;
  typingStatusText?: string;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

export default function MessageInput({
  onSend,
  onEditMessage,
  replyTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  disabled = false,
  typingStatusText,
  onTyping,
  onStopTyping,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Detect platform for search shortcut hint
  const searchShortcut = useMemo(() => {
    if (typeof window === "undefined") return "Ctrl + F";
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    return isMac ? "⌘ + F" : "Ctrl + F";
  }, []);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target as Node)
      ) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pre-populate textarea when editing
  useEffect(() => {
    if (editingMessage) {
      queueMicrotask(() => {
        setMessage(editingMessage.content);
        // Clear attachments when editing (we don't support editing attachments)
        setAttachments([]);
      });
    }
  }, [editingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150,
      )}px`;
    }
  }, [message]);

  // Focus textarea when replying or editing
  useEffect(() => {
    if ((replyTo || editingMessage) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo, editingMessage]);

  const handleSend = () => {
    // Stop typing indicator when message is sent
    onStopTyping?.();

    // If editing, call edit handler
    if (editingMessage && onEditMessage) {
      if (message.trim() && message.trim() !== editingMessage.content) {
        onEditMessage(editingMessage.id || "", message.trim());
        setMessage("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
      return;
    }

    if (message.trim() || attachments.length > 0) {
      onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Clear previous error
    setFileError(null);

    // Validate file sizes
    const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map((f) => f.name).join(", ");
      setFileError(
        `File(s) too large: ${fileNames}. Maximum size is 10MB per file.`,
      );
      e.target.value = "";

      // Auto-hide error after 5 seconds
      setTimeout(() => setFileError(null), 5000);
      return;
    }

    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTyping = () => {
    onTyping?.();
  };

  return (
    <div className="shrink-0 px-4 pb-3 pt-2 space-y-2">
      {/* File Error Message */}
      <AnimatePresence>
        {fileError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <p className="flex-1 text-xs text-red-600 dark:text-red-400">
                {fileError}
              </p>
              <button
                onClick={() => setFileError(null)}
                className="p-1 rounded-full transition-colors hover:bg-red-100 text-red-500 dark:hover:bg-red-500/20 dark:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Preview */}
      <AnimatePresence>
        {editingMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-50/80 dark:bg-amber-500/10">
              <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Editing message
                </span>
                <p className="text-xs truncate text-amber-600/70 dark:text-amber-500/60">
                  {editingMessage.content}
                </p>
              </div>
              <button
                onClick={onCancelEdit}
                className="p-1 rounded-full transition-colors hover:bg-amber-100 text-amber-500 dark:hover:bg-amber-500/20 dark:text-amber-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyTo && !editingMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-stone-100/80 dark:bg-white/3">
              <div className="w-0.5 h-8 rounded-full bg-teal-500 dark:bg-teal-400" />
              <CornerUpLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Replying to {replyTo.sender.name}
                </span>
                <p className="text-xs truncate text-stone-500 dark:text-white/40">
                  {replyTo.content}
                </p>
              </div>
              <button
                onClick={onCancelReply}
                className="p-1 rounded-full transition-colors hover:bg-stone-200 text-stone-400 dark:hover:bg-white/10 dark:text-white/40"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-stone-50 dark:bg-white/2">
              {attachments.map((file, index) => (
                <AttachmentPreview
                  key={index}
                  file={file}
                  onRemove={() => removeAttachment(index)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Input Container */}
      <div className="relative rounded-lg chat-message-input">
        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? "Uploading files..."
              : editingMessage
                ? "Edit your message..."
                : "Write a message..."
          }
          disabled={disabled}
          className="resize-none border-0 px-4 py-3 min-h-11 max-h-[150px] focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none focus:border-transparent focus-visible:border-transparent"
        />

        {/* Actions Bar */}
        <div className="flex items-center justify-between px-2 pb-2 gap-2">
          {/* Left Side - Attachment Actions */}
          {!editingMessage && (
            <div className="relative" ref={attachMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="h-8 w-8"
                title="Add attachment"
              >
                <Plus
                  className={`w-5 h-5 transition-transform duration-200 ${
                    showAttachMenu ? "rotate-45" : ""
                  }`}
                />
              </Button>

              {/* Attachment Menu Dropdown */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 py-1 px-2 rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-900 shadow-lg z-10"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="w-full justify-start gap-2"
                    >
                      <PaperclipIcon className="w-4 h-4" />
                      <span>Attach file</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        imageInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="w-full justify-start gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Upload image</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Right Side - Send Button */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Typing Indicator */}
            <AnimatePresence>
              {typingStatusText && (
                <motion.div
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5"
                >
                  <span className="text-xs italic text-stone-400 dark:text-white/40">
                    {typingStatusText}
                  </span>
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={
                disabled ||
                (editingMessage
                  ? !message.trim() || message.trim() === editingMessage.content
                  : !message.trim() && attachments.length === 0)
              }
              size="icon"
              className={`h-8 w-8 ${
                (message.trim() || attachments.length > 0) &&
                (!editingMessage || message.trim() !== editingMessage.content)
                  ? editingMessage
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
                  : ""
              }`}
              title={editingMessage ? "Save changes" : "Send message"}
            >
              <SendIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Hint */}
      <div className="flex justify-center">
        <span className="text-[10px] text-stone-400 dark:text-white/30">
          Press{" "}
          <kbd className="px-1.5 py-0.5 mx-0.5 rounded bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-white/40 font-mono text-[9px]">
            {searchShortcut}
          </kbd>{" "}
          to search
        </span>
      </div>
    </div>
  );
}

// Typing Indicator Component - Classic bouncing dots
function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0, opacity: 0.4 },
    animate: { y: -4, opacity: 1 },
  };

  const dotTransition = (delay: number) => ({
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    delay: delay,
  });

  return (
    <div className="flex items-center gap-1 h-full">
      <motion.span
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={dotTransition(0)}
        className="w-1 h-1 bg-stone-400 dark:bg-stone-500 rounded-full"
      />
      <motion.span
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={dotTransition(0.15)}
        className="w-1 h-1 bg-stone-400 dark:bg-stone-500 rounded-full"
      />
      <motion.span
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={dotTransition(0.3)}
        className="w-1 h-1 bg-stone-400 dark:bg-stone-500 rounded-full"
      />
    </div>
  );
}

// Attachment Preview Component
function AttachmentPreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const isImage = file.type.startsWith("image/");
  const preview = isImage ? URL.createObjectURL(file) : null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (isImage && preview) {
    return (
      <div className="relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt={file.name}
          className="h-16 w-16 object-cover rounded-lg"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded-b-lg">
          {formatFileSize(file.size)}
        </div>
        <button
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group flex flex-col gap-1 px-3 py-2 rounded-lg bg-stone-100 dark:bg-white/4">
      <div className="flex items-center gap-2">
        <PaperclipIcon className="w-4 h-4 text-stone-500 dark:text-white/45" />
        <span className="text-sm truncate max-w-[120px] text-stone-700 dark:text-white/70">
          {file.name}
        </span>
        <button
          onClick={onRemove}
          className="p-0.5 rounded-full transition-colors hover:bg-stone-200 dark:hover:bg-white/10"
        >
          <X className="w-3 h-3 text-stone-500 dark:text-white/45" />
        </button>
      </div>
      <span className="text-[10px] text-stone-500 dark:text-white/35">
        {formatFileSize(file.size)}
      </span>
    </div>
  );
}
