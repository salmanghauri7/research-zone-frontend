"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Message } from "../types";
import ChatMessage from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Loader2, Search, MessageSquare } from "lucide-react";

interface SearchResultsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  results: Message[];
  isLoading?: boolean;
  workspaceTitle?: string;
  onMessageClick?: (messageId: string) => void;
}

export default function SearchResultsPanel({
  isOpen,
  onClose,
  searchQuery,
  results,
  isLoading = false,
  workspaceTitle,
  onMessageClick,
}: SearchResultsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Search Results Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 lg:w-[480px] z-50 lg:z-auto lg:relative lg:h-auto flex flex-col border-l bg-white border-stone-200 dark:bg-stone-950 dark:border-white/6"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-white/6">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 dark:text-white text-base">
                  Search &quot;{searchQuery}&quot;
                  {workspaceTitle && (
                    <span className="text-stone-500 dark:text-stone-400 font-normal">
                      {" "}
                      in #{workspaceTitle}
                    </span>
                  )}
                </h3>
                {!isLoading && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      {results.length} result{results.length !== 1 ? "s" : ""}{" "}
                      found
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 ml-2 shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Sort/Filter Bar */}
            <div className="px-4 py-3 border-b border-stone-200 dark:border-white/6 bg-stone-50 dark:bg-stone-900/50">
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-sm h-auto p-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                Most relevant (default)
                <svg
                  className="w-4 h-4 ml-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </div>

            {/* Results */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Loader2 className="w-8 h-8 text-teal-500 dark:text-teal-400 animate-spin" />
                  <p className="mt-4 text-sm text-stone-500 dark:text-white/40">
                    Searching...
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-stone-100 dark:bg-white/4">
                    <Search className="w-7 h-7 text-stone-400 dark:text-white/25" />
                  </div>
                  <p className="text-sm text-center text-stone-500 dark:text-white/40">
                    No results found for &quot;{searchQuery}&quot;
                    <br />
                    Try different keywords
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-200 dark:divide-white/6">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="hover:bg-stone-50 dark:hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => {
                        if (result.id != null) onMessageClick?.(result.id);
                      }}
                    >
                      <ChatMessage
                        message={result}
                        isOwn={false}
                        disableActions={true}
                      />
                      <div className="px-4 pb-3">
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {/* Show if it's a thread reply */}
                          {result.parentMessageId ? (
                            <span className="inline-flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              Reply in a thread
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
