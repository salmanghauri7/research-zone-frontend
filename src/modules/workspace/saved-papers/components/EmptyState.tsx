"use client";

import { FolderPlus, FolderOpen } from "lucide-react";
import { Button } from "@/shared/components/ui";

interface EmptyStateProps {
  onCreateFolder: () => void;
}

export default function EmptyState({ onCreateFolder }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-6">
        <FolderOpen size={40} className="text-[var(--text-tertiary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        No folders yet
      </h3>
      <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm mb-6">
        Create folders to organize your saved research papers. You can nest
        folders to build a hierarchical structure.
      </p>
      <Button onClick={onCreateFolder} className="flex items-center gap-2">
        <FolderPlus size={18} />
        Create Your First Folder
      </Button>
    </div>
  );
}
