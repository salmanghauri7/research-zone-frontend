"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CornerDownLeft, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  isDisabled = false,
  placeholder = "Ask anything about this research paper...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(maxHeight, Math.max(minHeight, textarea.scrollHeight))}px`;
    }
  }, [message]);

  const minHeight = 44;
  const maxHeight = 200;

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = `${minHeight}px`;
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = message.trim().length > 0;

  return (
    <div className="px-4 sm:px-6 pb-6 pt-2 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent z-10 w-full relative">
      <div className="max-w-3xl mx-auto relative group">
        {/* Glow effect when active */}
        <div
          className={`absolute -inset-1 bg-gradient-to-r from-[var(--accent-primary)]/10 to-emerald-500/10 rounded-3xl blur transition-opacity duration-500 ${isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
        />

        <div
          className={`
            relative flex items-end gap-2 rounded-2xl bg-[var(--bg-secondary)] backdrop-blur-md
            transition-all duration-300 border
            ${
              isFocused
                ? "border-[var(--accent-primary)]/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] ring-2 ring-[var(--accent-primary)]/10"
                : "border-[var(--border-primary)] shadow-[var(--shadow-sm)] hover:border-[var(--border-secondary)]"
            }
            ${isDisabled ? "opacity-50 pointer-events-none" : "opacity-100"}
          `}
        >
          <div className="flex-1 min-w-0 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isDisabled}
              rows={1}
              style={{
                minHeight: `${minHeight}px`,
                maxHeight: `${maxHeight}px`,
              }}
              className="w-full block border-none resize-none bg-transparent px-4 py-3.5 text-[15px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-0 custom-scrollbar rounded-2xl"
              aria-label="Chat input"
            />
          </div>

          <div className="flex items-center gap-2 pr-2 pb-2 shrink-0">
            <AnimatePresence>
              {hasContent && (
                <motion.div
                  initial={{ opacity: 0, x: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 10, filter: "blur(4px)" }}
                  transition={{ duration: 0.2 }}
                  className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-tertiary)] text-[10px] font-medium text-[var(--text-tertiary)] select-none mr-1 border border-[var(--border-subtle)]"
                >
                  <span className="opacity-70">Return to</span>
                  <div className="flex items-center gap-1 bg-[var(--bg-primary)] px-1.5 py-0.5 rounded shadow-sm border border-[var(--border-subtle)]">
                    <CornerDownLeft size={10} strokeWidth={2.5} />
                    <span>Send</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Send Button */}
            <motion.button
              whileHover={hasContent && !isDisabled ? { scale: 1.05 } : {}}
              whileTap={hasContent && !isDisabled ? { scale: 0.95 } : {}}
              onClick={handleSend}
              disabled={!hasContent || isDisabled}
              aria-label="Send message"
              className={`
                p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center h-10 w-10 relative overflow-hidden group/btn
                ${
                  hasContent && !isDisabled
                    ? "bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-md"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                }
              `}
            >
              {hasContent && !isDisabled && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-y-full group-hover/btn:-translate-y-full transition-transform duration-500" />
              )}
              <Send
                size={16}
                className={`transition-transform duration-300 ${hasContent ? "-rotate-12 group-hover/btn:-rotate-45" : ""}`}
              />
            </motion.button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <Sparkles
            size={12}
            className="text-[var(--text-tertiary)] opacity-60"
          />
          <p className="text-[11px] font-medium text-[var(--text-tertiary)] text-center opacity-60">
            AI can make mistakes. Consider verifying critical information.
          </p>
        </div>
      </div>
    </div>
  );
}
