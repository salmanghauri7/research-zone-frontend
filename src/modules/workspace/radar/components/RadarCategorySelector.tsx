"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/shared/components/ui";

interface RadarCategorySelectorProps {
  categories: string[];
  selectedCategories: string[];
  isLoading: boolean;
  error: string | null;
  onToggle: (category: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onRefresh: () => void;
}

export default function RadarCategorySelector({
  categories,
  selectedCategories,
  isLoading,
  error,
  onToggle,
  onSelectAll,
  onClearAll,
  onRefresh,
}: RadarCategorySelectorProps) {
  return (
    <div className="flex flex-col h-full bg-(--bg-primary) border-r border-(--border-primary)">
      <div className="p-4 lg:p-6 pb-4 border-b border-(--border-primary) flex-none">
        <h3 className="text-sm font-semibold text-(--text-primary) mb-1">
          Categories to Scan
        </h3>
        <p className="text-xs text-(--text-tertiary) mb-4">
          Select tracking categories to watch.
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 text-xs flex-1 rounded-lg"
            onClick={onSelectAll}
            disabled={isLoading || categories.length === 0}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 text-xs flex-1 rounded-lg hover:bg-rose-50 hover:text-rose-600"
            onClick={onClearAll}
            disabled={isLoading || categories.length === 0}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg shrink-0 border border-transparent hover:border-(--border-primary)"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-4">
        {isLoading && (
          <div className="flex items-center justify-center p-6 text-sm text-(--text-tertiary)">
            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Loading
            categories...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!isLoading && !error && categories.length === 0 && (
          <div className="rounded-xl border border-dashed border-(--border-secondary) bg-(--bg-secondary) p-5 text-center text-sm text-(--text-tertiary)">
            No categories found yet. Save some papers to build your watchlist.
          </div>
        )}

        {!isLoading && categories.length > 0 && (
          <div className="space-y-1">
            {categories.map((category) => {
              const checked = selectedCategories.includes(category);
              return (
                <label
                  key={category}
                  className={`group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors border border-transparent ${
                    checked
                      ? "bg-(--accent-primary)/10 text-(--accent-primary) font-medium border-(--accent-primary)/20"
                      : "hover:bg-(--bg-secondary) text-(--text-primary)"
                  }`}
                >
                  <span className="truncate flex-1">{category}</span>
                  <div
                    className={`relative flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked
                        ? "bg-(--accent-primary) border-(--accent-primary)"
                        : "border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {checked && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <input
                      type="checkbox"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      checked={checked}
                      onChange={() => onToggle(category)}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
