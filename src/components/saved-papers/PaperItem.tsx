"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  MoreVertical,
  ExternalLink,
  Calendar,
  User,
} from "lucide-react";
import { Paper, ViewMode } from "./types";
import FolderContextMenu from "./FolderContextMenu";

interface PaperItemProps {
  paper: Paper;
  viewMode: ViewMode;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PaperItem({
  paper,
  viewMode,
  onEdit,
  onDelete,
}: PaperItemProps) {
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

  const truncateAuthors = (authors: string, maxLength = 50) => {
    if (authors.length <= maxLength) return authors;
    return authors.substring(0, maxLength) + "...";
  };

  if (viewMode === "grid") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative p-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/30 hover:shadow-[var(--shadow-md)] transition-all cursor-pointer"
          onClick={handleOpenLink}
          onContextMenu={handleContextMenu}
        >
          {/* More Button */}
          {(onEdit || onDelete) && (
            <button
              onClick={handleMoreClick}
              className="absolute top-2 right-2 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreVertical size={14} />
            </button>
          )}

          {/* Paper Icon */}
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
            <FileText size={20} className="text-blue-500" />
          </div>

          {/* Paper Title */}
          <h3 className="font-medium text-[var(--text-primary)] line-clamp-2 mb-1.5 text-sm leading-snug">
            {paper.title}
          </h3>

          {/* Authors */}
          <p className="text-xs text-[var(--text-tertiary)] truncate mb-1.5">
            {truncateAuthors(paper.authors, 40)}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(paper.published)}
            </span>
          </div>

          {/* Saved By */}
          <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] mt-1.5">
            <User size={11} />
            <span>{paper.savedBy}</span>
          </div>
        </motion.div>

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex items-center gap-4 p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/30 hover:shadow-[var(--shadow-md)] transition-all cursor-pointer"
        onClick={handleOpenLink}
        onContextMenu={handleContextMenu}
      >
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
          <button
            onClick={handleOpenLink}
            className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] transition-all"
            title="Open paper"
          >
            <ExternalLink size={16} />
          </button>

          {(onEdit || onDelete) && (
            <button
              onClick={handleMoreClick}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreVertical size={16} />
            </button>
          )}
        </div>
      </motion.div>

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
