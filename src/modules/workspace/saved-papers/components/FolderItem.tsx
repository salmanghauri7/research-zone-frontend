"use client";

import { useState } from "react";
import { Folder, MoreVertical } from "lucide-react";
import { Folder as FolderType } from "./types";
import FolderContextMenu from "./FolderContextMenu";

interface FolderItemProps {
  folder: FolderType;
  onNavigate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FolderItem({
  folder,
  onNavigate,
  onEdit,
  onDelete,
}: FolderItemProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Adjust position to stay within viewport
    const x = Math.min(e.clientX, window.innerWidth - 180);
    const y = Math.min(e.clientY, window.innerHeight - 120);

    setContextMenu({ x, y });
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(rect.left, window.innerWidth - 180);
    const y = Math.min(rect.bottom + 4, window.innerHeight - 120);
    setContextMenu({ x, y });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div
        className="group flex items-center gap-3 p-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/30 hover:shadow-[var(--shadow-md)] transition-all cursor-pointer"
        onClick={onNavigate}
        onContextMenu={handleContextMenu}
      >
        {/* Folder Icon */}
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
          <Folder size={20} className="text-[var(--accent-primary)]" />
        </div>

        {/* Folder Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--text-primary)] truncate text-sm">
            {folder.name}
          </h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            Created {formatDate(folder.createdAt)}
          </p>
        </div>

        {/* More Button */}
        <button
          onClick={handleMoreClick}
          className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <FolderContextMenu
        isOpen={!!contextMenu}
        onClose={() => setContextMenu(null)}
        onEdit={onEdit}
        onDelete={onDelete}
        position={contextMenu || { x: 0, y: 0 }}
      />
    </>
  );
}
