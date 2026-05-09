"use client";

import { useState, useCallback, useEffect } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

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
    <div className="border-b border-stone-200 dark:border-white/6 bg-white dark:bg-stone-950 px-4 py-3">
      <div className="flex items-center gap-3 max-w-2xl">
        <Search className="w-5 h-5 text-stone-400 dark:text-stone-500 shrink-0" />

        {/* Search Input */}
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search in ${workspaceTitle || "workspace"}...`}
          autoFocus
          className="flex-1 border-0 bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
        />

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8 shrink-0"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
