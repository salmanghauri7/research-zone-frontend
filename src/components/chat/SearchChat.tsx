"use client";

import { useState, useCallback, useEffect } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface SearchChatProps {
  workspaceTitle?: string;
  onSearch: (query: string) => void;
}

export default function SearchChat({
  workspaceTitle,
  onSearch,
}: SearchChatProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const setIsSearching = useWorkspaceStore((state) => state.setIsSearching);

  const handleClose = useCallback(() => {
    setIsSearching(false);
    setSearchQuery("");
  }, [setIsSearching]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  }, [searchQuery, onSearch]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "Enter") {
        handleSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, handleSearch]);

  return (
    <div className="border-b border-slate-200 dark:border-white/6 bg-white dark:bg-slate-950 px-4 py-3">
      <div className="flex items-center gap-3 max-w-2xl">
        {/* Search Icon */}
        <svg
          className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search in ${workspaceTitle || "workspace"}...`}
          autoFocus
          className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none text-sm"
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
          title="Close (Esc)"
        >
          <svg
            className="w-5 h-5 text-slate-600 dark:text-slate-400"
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
    </div>
  );
}
