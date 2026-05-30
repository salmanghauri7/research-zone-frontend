"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  MoreVertical,
  ExternalLink,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { Paper } from "./types";
import FolderContextMenu from "./FolderContextMenu";

interface PaperItemProps {
  paper: Paper;
  isHighlighted?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PaperItem({
  paper,
  isHighlighted = false,
  onEdit,
  onDelete,
}: PaperItemProps) {
  const paperRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (isHighlighted) {
      paperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isHighlighted]);

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

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(paper.link, "_blank", "noopener,noreferrer");
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
        className="group flex items-center gap-4 p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/30 hover:shadow-[var(--shadow-md)] transition-all cursor-pointer"
        onClick={handleOpenLink}
        onContextMenu={handleContextMenu}
      >
        {isHighlighted && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl bg-teal-400/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0.25, 0] }}
            transition={{ duration: 2.2, ease: "easeOut" }}
          />
        )}

        {/* Paper Icon */}
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <FileText size={20} className="text-blue-500" />
        </div>

        {/* Paper Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--text-primary)] truncate text-sm mb-0.5">
            {paper.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            <span className="truncate max-w-[300px]">{paper.authors}</span>
            <span className="flex items-center gap-1 shrink-0">
              <Calendar size={11} />
              {formatDate(paper.published)}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <User size={11} />
              {paper.savedBy}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            onClick={handleOpenLink}
            variant="ghost"
            className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-all h-9 w-9"
            title="Open paper"
          >
            <ExternalLink size={16} />
          </Button>

          {(onEdit || onDelete) && (
            <Button
              onClick={handleMoreClick}
              variant="ghost"
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-all h-9 w-9"
            >
              <MoreVertical size={16} />
            </Button>
          )}
        </div>
      </div>

      {(onEdit || onDelete) && (
        <FolderContextMenu
          isOpen={!!contextMenu}
          onClose={() => setContextMenu(null)}
          onEdit={onEdit || (() => {})}
          onDelete={onDelete || (() => {})}
          position={contextMenu || { x: 0, y: 0 }}
        />
      )}
    </>
  );
}
