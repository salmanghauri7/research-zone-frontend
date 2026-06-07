"use client";

import { Rocket, Radar as RadarIcon } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { RadarStatus } from "../hooks";

interface RadarHeaderProps {
  status: RadarStatus;
  isStarting: boolean;
  selectedCount: number;
  totalCategories: number;
  completedCategories: number;
  findingsCount: number;
  onStart: () => void;
}

export default function RadarHeader({
  status,
  isStarting,
  selectedCount,
  totalCategories,
  completedCategories,
  findingsCount,
  onStart,
}: RadarHeaderProps) {
  return (
    <div className="px-6 py-6 md:py-8 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-(--accent-primary)">
            <RadarIcon className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Radar Scan
            </span>
          </div>
          <h2 className="text-2xl font-bold text-(--text-primary)">
            Scan for contradictions and relevance
          </h2>
          <p className="text-sm text-(--text-tertiary) max-w-2xl text-balance">
            Choose the categories you care about, then run a scan. Radar will
            stream live signals as it compares new arXiv papers against your
            saved library in real-time.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <Button
            onClick={onStart}
            disabled={isStarting || status === "running"}
            className="px-6 py-5 rounded-xl flex items-center gap-2 w-full md:w-auto shadow-sm"
          >
            {status === "running" ? (
              <span className="h-4 w-4 relative flex">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white/80"></span>
              </span>
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            <span className="font-medium">
              {isStarting
                ? "Starting..."
                : status === "running"
                  ? "Scanning..."
                  : "Run Radar Scan"}
            </span>
          </Button>

          <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-(--text-secondary) bg-(--bg-secondary)/60 px-3 py-2 rounded-lg border border-(--border-primary)/50">
            <span className="flex items-center gap-1.5">
              Status:
              <span className="capitalize font-medium text-(--text-primary)">
                {status}
              </span>
            </span>
            <div className="w-px h-3 bg-(--border-primary)"></div>
            <span>
              Selected categories:{" "}
              <span className="font-medium text-(--text-primary)">
                {selectedCount}
              </span>
            </span>
            <div className="w-px h-3 bg-(--border-primary)"></div>
            <span>
              Completed:{" "}
              <span className="font-medium text-(--text-primary)">
                {completedCategories}/{totalCategories || "-"}
              </span>
            </span>
            <div className="w-px h-3 bg-(--border-primary)"></div>
            <span className="flex items-center gap-1 font-medium bg-(--accent-primary)/10 text-(--accent-primary) px-2 py-0.5 rounded-full">
              {findingsCount} Findings
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
