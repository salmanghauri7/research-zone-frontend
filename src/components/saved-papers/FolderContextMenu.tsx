"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Edit3, Trash2 } from "lucide-react";

interface FolderContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

export default function FolderContextMenu({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  position,
}: FolderContextMenuProps) {
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = () => onClose();
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50 bg-[var(--bg-primary)] rounded-xl shadow-lg border border-[var(--border-primary)] py-2 min-w-40"
      style={{
        top: position.y,
        left: position.x,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-3 transition-colors"
      >
        <Edit3 size={16} className="text-[var(--text-secondary)]" />
        Rename
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--bg-hover)] flex items-center gap-3 transition-colors"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </motion.div>
  );
}
