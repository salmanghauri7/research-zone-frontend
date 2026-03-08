"use client";

import { Grid3X3, List, SortAsc } from "lucide-react";
import { SortOption, ViewMode } from "./types";

interface FolderControlsProps {
  sortBy: SortOption;
  viewMode: ViewMode;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function FolderControls({
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
}: FolderControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Sort Dropdown */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <SortAsc size={16} className="text-[var(--text-secondary)]" />
          <span className="text-[var(--text-secondary)]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-[var(--accent-primary)] font-medium focus:outline-none cursor-pointer"
          >
            <option value="dateAdded">Date Added</option>
            <option value="dateModified">Date Modified</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-2 rounded-md transition-colors ${
            viewMode === "grid"
              ? "bg-[var(--bg-primary)] text-[var(--accent-primary)] shadow-sm"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          }`}
          title="Grid view"
        >
          <Grid3X3 size={16} />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-2 rounded-md transition-colors ${
            viewMode === "list"
              ? "bg-[var(--bg-primary)] text-[var(--accent-primary)] shadow-sm"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          }`}
          title="List view"
        >
          <List size={16} />
        </button>
      </div>
    </div>
  );
}
