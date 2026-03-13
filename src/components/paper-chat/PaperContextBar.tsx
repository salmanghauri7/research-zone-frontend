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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 sm:mx-6 mt-4 mb-2"
    >
      <div className="max-w-3xl mx-auto relative rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
        {/* Subtle gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/40 to-transparent" />

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Paper icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-blue-500" />
          </div>

          {/* Paper info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {paper.title}
              </h3>
              <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--accent-subtle)] shrink-0">
                <Sparkles size={10} className="text-[var(--accent-primary)]" />
                <span className="text-[10px] font-medium text-[var(--accent-primary)]">
                  AI Ready
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-[var(--text-tertiary)] truncate flex items-center gap-1">
                <User size={10} className="shrink-0" />
                {truncateAuthors(paper.authors)}
              </span>
              <span className="hidden sm:flex text-xs text-[var(--text-tertiary)] items-center gap-1 shrink-0">
                <Calendar size={10} />
                {formatDate(paper.published)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() =>
                window.open(paper.link, "_blank", "noopener,noreferrer")
              }
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-blue-500/10 transition-all"
              title="Open paper"
            >
              <ExternalLink size={15} />
            </button>
            <button
              onClick={onChangePaper}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-subtle)] transition-all"
              title="Switch paper"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-all"
              title="End chat"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
