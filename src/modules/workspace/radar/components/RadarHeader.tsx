"use client";

import { Rocket, Radar as RadarIcon } from "lucide-react";
import { Button, Card, CardContent } from "@/shared/components/ui";
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
    <Card className="rounded-2xl border border-(--border-primary)">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-(--accent-primary)">
              <RadarIcon className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Radar
              </span>
            </div>
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Scan for contradictions and relevance in the latest papers.
            </h2>
            <p className="text-sm text-(--text-tertiary) max-w-2xl">
              Choose the categories you care about, then run a scan. Radar will
              stream live signals as it compares new arXiv papers against your
              saved library.
            </p>
          </div>

          <Button
            onClick={onStart}
            disabled={isStarting || status === "running"}
            className="px-4 py-2.5 rounded-xl flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            {isStarting ? "Starting..." : "Run Radar Scan"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-(--text-secondary)">
          <span>Status: {status}</span>
          <span>Selected categories: {selectedCount}</span>
          <span>
            Completed categories: {completedCategories}/{totalCategories || "-"}
          </span>
          <span>Findings: {findingsCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
