"use client";

import { SortAsc } from "lucide-react";
import { SortOption } from "./types";

interface FolderControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function FolderControls({
  sortBy,
  onSortChange,
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
            className="rounded-md border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--accent-primary)] font-medium focus:outline-none cursor-pointer"
          >
            <option value="dateAdded">Date Added</option>
            <option value="dateModified">Date Modified</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </div>
  );
}
