"use client";

import { Activity, Radar as RadarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import RadarFindingCard from "./RadarFindingCard";
import { RadarFinding } from "../types";
import { RadarStatus } from "../hooks";

interface RadarFindingsStreamProps {
  findings: RadarFinding[];
  status: RadarStatus;
  totalCategories: number;
  completedCategories: number;
}

export default function RadarFindingsStream({
  findings,
  status,
  totalCategories,
  completedCategories,
}: RadarFindingsStreamProps) {
  const hasFindings = findings.length > 0;

  return (
    <Card className="rounded-2xl border border-(--border-primary) h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold text-(--text-primary) flex items-center gap-2">
          <Activity className="w-4 h-4 text-(--accent-primary)" />
          Live Findings
        </CardTitle>
        <p className="text-xs text-(--text-tertiary)">
          {status === "running"
            ? "Streaming new contradictions and relevance signals as they arrive."
            : "Your most recent scan results will appear here."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-xs text-(--text-secondary)">
          <span>
            Status:{" "}
            {status === "running"
              ? "Running"
              : status === "complete"
                ? "Completed"
                : "Idle"}
          </span>
          <span>
            Categories: {completedCategories}/{totalCategories || "-"}
          </span>
          <span>Findings: {findings.length}</span>
        </div>

        {!hasFindings && status === "idle" && (
          <div className="rounded-xl border border-dashed border-(--border-secondary) bg-(--bg-secondary) p-6 text-center">
            <RadarIcon className="w-6 h-6 text-(--accent-primary) mx-auto mb-2" />
            <p className="text-sm font-medium text-(--text-primary)">
              Radar has not run yet.
            </p>
            <p className="text-xs text-(--text-tertiary) mt-1">
              Run a scan to detect contradictions and relevance in new papers.
            </p>
          </div>
        )}

        {!hasFindings && status === "running" && (
          <div className="rounded-xl border border-dashed border-(--border-secondary) bg-(--bg-secondary) p-6 text-center">
            <div className="w-6 h-6 border-2 border-(--accent-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm font-medium text-(--text-primary)">
              Scanning new papers.
            </p>
            <p className="text-xs text-(--text-tertiary) mt-1">
              Findings will stream in as soon as signals are detected.
            </p>
          </div>
        )}

        {!hasFindings && status === "complete" && (
          <div className="rounded-xl border border-dashed border-(--border-secondary) bg-(--bg-secondary) p-6 text-center">
            <p className="text-sm font-medium text-(--text-primary)">
              No contradictions or relevance found in this run.
            </p>
            <p className="text-xs text-(--text-tertiary) mt-1">
              Try again later or broaden your categories.
            </p>
          </div>
        )}

        {hasFindings && (
          <div className="space-y-3">
            {findings.map((finding) => (
              <RadarFindingCard key={finding._id} finding={finding} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
