"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Message } from "./types";
import ChatMessage from "./ChatMessage";

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
            className="fixed right-0 top-0 h-full w-full sm:w-96 lg:w-[480px] z-50 lg:z-auto lg:relative lg:h-auto flex flex-col border-l bg-white border-slate-200 dark:bg-slate-950 dark:border-white/6"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/6">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Search &quot;{searchQuery}&quot;
                  {workspaceTitle && (
                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                      {" "}
                      in #{workspaceTitle}
                    </span>
                  )}
                </h3>
                {!isLoading && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {results.length} result{results.length !== 1 ? "s" : ""}{" "}
                      found
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:hover:bg-white/5 dark:text-white/50 dark:hover:text-white ml-2 shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Sort/Filter Bar */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/6 bg-slate-50 dark:bg-slate-900/50">
              <button className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
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
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 dark:border-slate-700 dark:border-t-indigo-400 rounded-full animate-spin" />
                  <p className="mt-4 text-sm text-slate-500 dark:text-white/40">
                    Searching...
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-slate-100 dark:bg-white/4">
                    <svg
                      className="w-7 h-7 text-slate-400 dark:text-white/25"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-center text-slate-500 dark:text-white/40">
                    No results found for &quot;{searchQuery}&quot;
                    <br />
                    Try different keywords
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/6">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => onMessageClick?.(result.id)}
                    >
                      <ChatMessage
                        message={result}
                        isOwn={false}
                        disableActions={true}
                      />
                      <div className="px-4 pb-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {/* Show if it's a thread reply */}
                          {result.parentMessageId ? (
                            <>
                              <span className="inline-flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                                Reply in a thread
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
