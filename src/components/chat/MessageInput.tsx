"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "./types";
import {
  FiPaperclip,
  FiImage,
  FiMic,
  FiSend,
  FiX,
  FiCornerUpLeft,
  FiSquare,
  FiEdit3,
} from "react-icons/fi";

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  replyTo?: Message | null;
  editingMessage?: Message | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  disabled?: boolean;
  typingStatusText?: string;
  socket?: any;
  currentUser?: string;
  workspaceId?: string;
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
  socket,
  currentUser,
  workspaceId,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);

  // Pre-populate textarea when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      // Clear attachments when editing (we don't support editing attachments)
      setAttachments([]);
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
    // IMMEDIATELY clear typing timeout and emit stop_typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (socket && currentUser && workspaceId && isTypingRef.current) {
      socket.emit("stop_typing", { username: currentUser, workspaceId });
      isTypingRef.current = false;
    }

    // If editing, call edit handler
    if (editingMessage && onEditMessage) {
      if (message.trim() && message.trim() !== editingMessage.content) {
        onEditMessage(editingMessage.id, message.trim());
        setMessage("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
      return;
    }

    // Normal send
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
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleTyping = () => {
    if (!socket || !currentUser || !workspaceId) return;

    // Only emit 'typing' if we haven't already told the server we are typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { username: currentUser, workspaceId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { username: currentUser, workspaceId });
      isTypingRef.current = false; // Reset here
    }, 2000);
  };

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white dark:border-white/10 dark:bg-black">
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
            <div className="flex items-center gap-3 px-4 py-2 border-b bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20">
              <FiEdit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Edit message
                </span>
                <p className="text-xs truncate text-amber-600 dark:text-amber-500/80">
                  {editingMessage.content}
                </p>
              </div>
              <button
                onClick={onCancelEdit}
                className="p-1 rounded-full transition-colors hover:bg-amber-100 text-amber-500 dark:hover:bg-amber-500/20 dark:text-amber-400"
              >
                <FiX className="w-4 h-4" />
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
            <div className="flex items-center gap-3 px-4 py-2 border-b bg-gray-50 border-gray-100 dark:bg-white/[0.02] dark:border-white/10">
              <FiCornerUpLeft className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Replying to {replyTo.sender.name}
                </span>
                <p className="text-xs truncate text-gray-500 dark:text-white/50">
                  {replyTo.content}
                </p>
              </div>
              <button
                onClick={onCancelReply}
                className="p-1 rounded-full transition-colors hover:bg-gray-200 text-gray-400 dark:hover:bg-white/10 dark:text-white/50"
              >
                <FiX className="w-4 h-4" />
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
            <div className="flex flex-wrap gap-2 px-4 py-3">
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

      {/* Input Area */}
      <div className="flex items-end gap-2 p-4">
        {/* Attachment Actions - Hidden when editing */}
        {!editingMessage && (
          <div className="flex items-center gap-1">
            {/* File Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white/80"
              title="Attach file"
            >
              <FiPaperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Image Upload */}
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white/80"
              title="Share image"
            >
              <FiImage className="w-5 h-5" />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Voice Message */}
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-lg transition-colors ${isRecording
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                : "hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white/80"
                }`}
              title={isRecording ? "Stop recording" : "Voice message"}
            >
              {isRecording ? (
                <FiSquare className="w-5 h-5" />
              ) : (
                <FiMic className="w-5 h-5" />
              )}
            </button>

            {/* Recording Timer */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-600 dark:text-white/70">
                    {formatRecordingTime(recordingTime)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex flex-col flex-1 gap-1  -mb-3">
          {/* Text Input */}
          <div className="flex-1 flex items-end rounded-xl border transition-colors bg-gray-50 border-gray-200 focus-within:border-gray-300 dark:bg-white/5 dark:border-white/10 dark:focus-within:border-white/20">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                editingMessage ? "Edit your message..." : "Type message here..."
              }
              disabled={disabled || isRecording}
              rows={1}
              className="flex-1 resize-none px-4 py-3 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-white/40"
            />
          </div>
          <h6 className="text-[10px] ml-2 h-4 min-w-[100px] text-gray-500 dark:text-white/50 flex items-center gap-2">
            <AnimatePresence>
              {typingStatusText && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5"
                >
                  <span className="italic leading-none">{typingStatusText}</span>
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
          </h6>
        </div>

        {/* Send/Save Button */}
        <button
          onClick={handleSend}
          disabled={
            disabled ||
            !message.trim() ||
            Boolean(editingMessage && message.trim() === editingMessage.content)
          }
          className={`p-3 rounded-xl transition-all duration-200 ${message.trim() &&
            (!editingMessage || message.trim() !== editingMessage.content)
            ? editingMessage
              ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25"
              : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25"
            : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-white/30"
            }`}
          title={editingMessage ? "Save changes" : "Send message"}
        >
          <FiSend className="w-5 h-5" />
        </button>
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
        className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"
      />
      <motion.span
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={dotTransition(0.15)}
        className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"
      />
      <motion.span
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={dotTransition(0.3)}
        className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"
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
        <button
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FiX className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5">
      <FiPaperclip className="w-4 h-4 text-gray-500 dark:text-white/50" />
      <span className="text-sm truncate max-w-[120px] text-gray-700 dark:text-white/80">
        {file.name}
      </span>
      <button
        onClick={onRemove}
        className="p-0.5 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-white/10"
      >
        <FiX className="w-3 h-3 text-gray-500 dark:text-white/50" />
      </button>
    </div>
  );
}
