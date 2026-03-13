"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, CornerDownLeft } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  isDisabled = false,
  placeholder = "Ask anything about this paper...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
      <div className="relative max-w-3xl mx-auto">
        <div
          className={`
            relative flex items-end gap-2 rounded-2xl border bg-[var(--bg-secondary)]
            transition-all duration-200
            ${
              message.trim()
                ? "border-[var(--accent-primary)]/40 shadow-[0_0_0_3px_var(--accent-primary)]/8"
                : "border-[var(--border-primary)] shadow-[var(--shadow-sm)]"
            }
            ${isDisabled ? "opacity-60" : ""}
          `}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none min-h-[48px] max-h-[160px] custom-scrollbar"
          />

          <div className="flex items-center gap-1 pr-2 pb-2">
            {/* Keyboard hint */}
            {message.trim() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] mr-1"
              >
                <CornerDownLeft size={10} />
                <span>send</span>
              </motion.div>
            )}

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!message.trim() || isDisabled}
              className={`
                p-2.5 rounded-xl transition-all duration-200
                ${
                  message.trim() && !isDisabled
                    ? "bg-[var(--accent-primary)] text-white shadow-md hover:bg-[var(--accent-hover)]"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                }
              `}
            >
              <Send size={16} className={message.trim() ? "-rotate-12" : ""} />
            </motion.button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-2 opacity-60">
          AI responses are generated based on the paper content and may not be
          perfectly accurate.
        </p>
      </div>
    </div>
  );
}
