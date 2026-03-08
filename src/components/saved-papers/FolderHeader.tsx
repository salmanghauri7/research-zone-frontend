"use client";

import { FolderPlus } from "lucide-react";

interface FolderHeaderProps {
  title: string;
  folderCount: number;
  paperCount?: number;
  onCreateFolder: () => void;
}

export default function FolderHeader({
  title,
  folderCount,
  paperCount = 0,
  onCreateFolder,
}: FolderHeaderProps) {
  const getCountText = () => {
    const parts = [];
    if (folderCount > 0) {
      parts.push(`${folderCount} ${folderCount === 1 ? "folder" : "folders"}`);
    }
    if (paperCount > 0) {
      parts.push(`${paperCount} ${paperCount === 1 ? "paper" : "papers"}`);
    }
    if (parts.length === 0) return "Empty directory";
    return parts.join(", ");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {getCountText()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onCreateFolder}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-medium text-sm hover:bg-[var(--bg-hover)] hover:border-[var(--accent-primary)]/30 transition-all"
        >
          <FolderPlus size={16} className="text-[var(--accent-primary)]" />
          Create Folder
        </button>
      </div>
    </div>
  );
}
