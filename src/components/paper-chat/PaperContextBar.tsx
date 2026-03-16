"use client";

import { motion } from "framer-motion";
import {
  FileText,
  ExternalLink,
  RefreshCw,
  X,
  Calendar,
  User,
  Sparkles,
} from "lucide-react";
import { Paper } from "@/components/saved-papers/types";

interface PaperContextBarProps {
  paper: Paper;
  onChangePaper: () => void;
  onClose: () => void;
}

export default function PaperContextBar({
  paper,
  onChangePaper,
  onClose,
}: PaperContextBarProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const truncateAuthors = (authors: string, maxLength = 60) =>
    authors.length <= maxLength
      ? authors
      : authors.substring(0, maxLength) + "...";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="mx-4 sm:mx-6 mt-4 mb-2 z-20"
    >
      <div className="max-w-3xl mx-auto relative rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl shadow-sm hover:shadow-md hover:border-[var(--border-secondary)] transition-all duration-300 overflow-hidden group">
        {/* Subtle gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center gap-3.5 px-4 py-3">
          {/* Paper icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <FileText size={18} className="text-blue-500" />
          </div>

          {/* Paper info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm sm:text-[15px] font-semibold text-[var(--text-primary)] truncate">
                {paper.title}
              </h3>
              <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 shrink-0">
                <Sparkles size={10} className="text-[var(--accent-primary)]" />
                <span className="text-[10px] font-bold tracking-wide text-[var(--accent-primary)] uppercase">
                  Ready
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-tertiary)] truncate flex items-center gap-1.5 font-medium">
                <User size={12} className="shrink-0" />
                {truncateAuthors(paper.authors)}
              </span>
              <span className="hidden sm:flex text-xs text-[var(--text-tertiary)] items-center gap-1.5 shrink-0 font-medium border-l border-[var(--border-primary)] pl-3">
                <Calendar size={12} />
                {formatDate(paper.published)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-subtle)] shadow-sm">
            <button
              onClick={() =>
                window.open(paper.link, "_blank", "noopener,noreferrer")
              }
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              aria-label="Open original paper in new tab"
              title="Open paper"
            >
              <ExternalLink size={16} />
            </button>
            <div className="w-px h-4 bg-[var(--border-subtle)]" />
            <button
              onClick={onChangePaper}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
              aria-label="Switch to a different paper"
              title="Switch paper"
            >
              <RefreshCw size={16} />
            </button>
            <div className="w-px h-4 bg-[var(--border-subtle)]" />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              aria-label="End chat session"
              title="End chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
