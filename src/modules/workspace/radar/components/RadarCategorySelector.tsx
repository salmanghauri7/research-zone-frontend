"use client";

import { RefreshCcw } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";

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
    <Card className="rounded-2xl border border-(--border-primary)">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold text-(--text-primary)">
          Categories to Scan
        </CardTitle>
        <p className="text-xs text-(--text-tertiary)">
          Select the saved-paper categories you want Radar to watch.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={onSelectAll}
            disabled={isLoading || categories.length === 0}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            onClick={onClearAll}
            disabled={isLoading || categories.length === 0}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-dashed border-(--border-secondary) bg-(--bg-secondary) p-4 text-sm text-(--text-tertiary)">
            Loading categories...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!isLoading && !error && categories.length === 0 && (
          <div className="rounded-xl border border-dashed border-(--border-secondary) bg-(--bg-secondary) p-4 text-sm text-(--text-tertiary)">
            No categories found yet. Save some papers to build your Radar
            watchlist.
          </div>
        )}

        {!isLoading && categories.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {categories.map((category) => {
              const checked = selectedCategories.includes(category);
              return (
                <label
                  key={category}
                  className="flex items-center justify-between gap-3 rounded-lg border border-(--border-secondary) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary) cursor-pointer"
                >
                  <span className="truncate">{category}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-(--accent-primary)"
                    checked={checked}
                    onChange={() => onToggle(category)}
                  />
                </label>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
