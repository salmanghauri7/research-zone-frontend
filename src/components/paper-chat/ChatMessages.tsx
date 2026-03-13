"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { ChatMessage as ChatMessageType } from "./types";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isWaitingResponse?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 sm:px-6 py-3 max-w-3xl mx-auto">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
        <Bot size={16} className="text-[var(--accent-primary)]" />
      </div>
      <div className="flex items-center gap-1.5 py-3 px-4 rounded-2xl rounded-tl-md bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"
        />
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"
        />
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"
        />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessageType }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // Simple markdown-like formatting for AI responses
  const formatContent = (text: string) => {
    // Split into paragraphs
    return text.split("\n\n").map((paragraph, pIdx) => {
      // Check for headings
      if (paragraph.startsWith("### ")) {
        return (
          <h4
            key={pIdx}
            className="font-semibold text-[var(--text-primary)] mt-3 mb-1.5 text-sm"
          >
            {paragraph.replace("### ", "")}
          </h4>
        );
      }
      if (paragraph.startsWith("## ")) {
        return (
          <h3
            key={pIdx}
            className="font-bold text-[var(--text-primary)] mt-3 mb-1.5"
          >
            {paragraph.replace("## ", "")}
          </h3>
        );
      }

      // Check for bullet lists
      const lines = paragraph.split("\n");
      const isList = lines.every(
        (l) => l.startsWith("- ") || l.startsWith("• ") || l.trim() === "",
      );
      if (
        isList &&
        lines.some((l) => l.startsWith("- ") || l.startsWith("• "))
      ) {
        return (
          <ul key={pIdx} className="space-y-1 my-2">
            {lines
              .filter((l) => l.trim())
              .map((line, lIdx) => (
                <li
                  key={lIdx}
                  className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--accent-primary)] mt-2 shrink-0" />
                  <span>{line.replace(/^[-•]\s*/, "")}</span>
                </li>
              ))}
          </ul>
        );
      }

      // Check for numbered lists
      const isNumberedList = lines.every(
        (l) => /^\d+\.\s/.test(l) || l.trim() === "",
      );
      if (isNumberedList && lines.some((l) => /^\d+\.\s/.test(l))) {
        return (
          <ol key={pIdx} className="space-y-1.5 my-2">
            {lines
              .filter((l) => l.trim())
              .map((line, lIdx) => (
                <li
                  key={lIdx}
                  className="text-sm text-[var(--text-secondary)] flex items-start gap-2.5"
                >
                  <span className="text-[10px] font-bold text-[var(--accent-primary)] bg-[var(--accent-subtle)] w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    {lIdx + 1}
                  </span>
                  <span>{line.replace(/^\d+\.\s*/, "")}</span>
                </li>
              ))}
          </ol>
        );
      }

      // Regular paragraph
      return (
        <p
          key={pIdx}
          className="text-sm text-[var(--text-secondary)] leading-relaxed my-1.5"
        >
          {paragraph.split("\n").map((line, lIdx) => (
            <span key={lIdx}>
              {lIdx > 0 && <br />}
              {/* Bold text */}
              {line.split(/(\*\*[^*]+\*\*)/).map((part, partIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong
                      key={partIdx}
                      className="font-semibold text-[var(--text-primary)]"
                    >
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                // Inline code
                return part.split(/(`[^`]+`)/).map((subPart, subIdx) => {
                  if (subPart.startsWith("`") && subPart.endsWith("`")) {
                    return (
                      <code
                        key={`${partIdx}-${subIdx}`}
                        className="text-xs px-1.5 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--accent-primary)] font-mono"
                      >
                        {subPart.slice(1, -1)}
                      </code>
                    );
                  }
                  return <span key={`${partIdx}-${subIdx}`}>{subPart}</span>;
                });
              })}
            </span>
          ))}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`flex items-start gap-3 px-4 sm:px-6 py-2 max-w-3xl mx-auto ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-gradient-to-br from-violet-500/20 to-purple-500/20"
            : "bg-gradient-to-br from-teal-500/20 to-emerald-500/20"
        }`}
      >
        {isUser ? (
          <User size={15} className="text-violet-500 dark:text-violet-400" />
        ) : (
          <Bot size={15} className="text-[var(--accent-primary)]" />
        )}
      </div>

      {/* Content */}
      <div
        className={`group relative max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`
            px-4 py-3 rounded-2xl transition-all
            ${
              isUser
                ? "bg-[var(--accent-primary)] text-white rounded-tr-md"
                : "bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-tl-md"
            }
          `}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="prose-custom">{formatContent(message.content)}</div>
          )}
        </div>

        {/* Meta row */}
        <div
          className={`flex items-center gap-2 mt-1 px-1 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {formatTime(message.timestamp)}
          </span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] opacity-0 group-hover:opacity-100 transition-all"
              title="Copy response"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatMessages({
  messages,
  isWaitingResponse = false,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaitingResponse]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto custom-scrollbar py-4"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </AnimatePresence>

      {isWaitingResponse && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
