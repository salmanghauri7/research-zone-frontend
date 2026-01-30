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
} from "react-icons/fi";

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MessageInput({
  onSend,
  replyTo,
  onCancelReply,
  placeholder = "Type a message...",
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Focus textarea when replying
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleSend = () => {
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

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white dark:border-white/10 dark:bg-black">
      {/* Reply Preview */}
      <AnimatePresence>
        {replyTo && (
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
        {/* Attachment Actions */}
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
            className={`p-2 rounded-lg transition-colors ${
              isRecording
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

        {/* Text Input */}
        <div className="flex-1 flex items-end rounded-xl border transition-colors bg-gray-50 border-gray-200 focus-within:border-gray-300 dark:bg-white/5 dark:border-white/10 dark:focus-within:border-white/20">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isRecording}
            rows={1}
            className="flex-1 resize-none px-4 py-3 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-white/40"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className={`p-3 rounded-xl transition-all duration-200 ${
            message.trim() || attachments.length > 0
              ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25"
              : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-white/30"
          }`}
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>
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
