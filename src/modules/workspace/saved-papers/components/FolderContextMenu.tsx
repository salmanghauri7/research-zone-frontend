"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Edit3, Trash2 } from "lucide-react";
import { Button, Card, CardContent } from "@/shared/components/ui";

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
      className="fixed z-50 min-w-40"
      style={{
        top: position.y,
        left: position.x,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="bg-[var(--bg-primary)] shadow-lg border border-[var(--border-primary)] py-2">
        <CardContent className="p-0">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              onClose();
            }}
            variant="ghost"
            className="w-full px-4 py-2 text-left justify-start text-sm text-[var(--text-primary)]"
          >
            <Edit3 size={16} className="text-[var(--text-secondary)]" />
            Rename
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              onClose();
            }}
            variant="ghost"
            className="w-full px-4 py-2 text-left justify-start text-sm text-[var(--error)]"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
