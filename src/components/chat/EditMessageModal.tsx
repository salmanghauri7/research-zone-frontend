"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "./types";
import { FiX } from "react-icons/fi";

interface EditMessageModalProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContent: string) => void;
}

// Inner component that receives initial content as key prop to reset state
function EditMessageModalContent({
  initialContent,
  onClose,
  onSave,
  originalContent,
}: {
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => void;
  originalContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200,
      )}px`;
    }
  }, [content]);

  const handleSave = useCallback(() => {
    if (content.trim()) {
      onSave(content.trim());
    }
  }, [content, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden bg-white border-gray-200 dark:bg-[#0C0F16] dark:border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Edit message
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-700 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500/30 focus:border-blue-500 dark:bg-white/5 dark:border-white/15 dark:text-white dark:placeholder-white/40 dark:focus:ring-white/30 dark:focus:border-white/30"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-white/40">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 font-mono">
            Enter
          </kbd>{" "}
          to save or{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 font-mono">
            Esc
          </kbd>{" "}
          to cancel
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!content.trim() || content.trim() === originalContent}
          className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

export default function EditMessageModal({
  message,
  isOpen,
  onClose,
  onSave,
}: EditMessageModalProps) {
  return (
    <AnimatePresence>
      {isOpen && message && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <EditMessageModalContent
              key={message.id}
              initialContent={message.content}
              originalContent={message.content}
              onClose={onClose}
              onSave={onSave}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
