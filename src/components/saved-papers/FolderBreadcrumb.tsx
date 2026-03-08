"use client";

import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbItem } from "./types";

interface FolderBreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
}

export default function FolderBreadcrumb({
  items,
  onNavigate,
}: FolderBreadcrumbProps) {
  // Don't render breadcrumbs if we're at root level
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 flex-wrap text-sm">
      {/* Root/Home button */}
      <button
        onClick={() => onNavigate({ id: null, name: "Saved Papers" })}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
      >
        <Home size={14} />
        <span className="truncate max-w-[120px] sm:max-w-none">
          Saved Papers
        </span>
      </button>

      {items.map((item, index) => (
        <div key={item.id || "root"} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
          <button
            onClick={() => onNavigate(item)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
              index === items.length - 1
                ? "text-[var(--text-primary)] font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <span className="truncate max-w-[120px] sm:max-w-none">
              {item.name}
            </span>
          </button>
        </div>
      ))}
    </nav>
  );
}
