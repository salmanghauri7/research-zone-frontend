"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui";
import { RadarFinding } from "../types";

interface RadarFindingCardProps {
  finding: RadarFinding;
}

const badgeStyles: Record<string, string> = {
  contradiction: "bg-rose-100 text-rose-700 border-rose-200",
  relevance: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function RadarFindingCard({ finding }: RadarFindingCardProps) {
  const alertTypes = Array.isArray(finding.alertType)
    ? finding.alertType
    : [finding.alertType];

  const papers = finding.newPapers || [];
  const previewPapers = papers.slice(0, 3);
  const remainingCount = Math.max(papers.length - previewPapers.length, 0);

  return (
    <Card className="rounded-xl border border-(--border-primary)">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs text-(--text-tertiary)">Category</p>
            <p className="text-sm font-semibold text-(--text-primary)">
              {finding.category}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertTypes.map((type) => (
              <span
                key={type}
                className={`text-[11px] uppercase tracking-wide border px-2 py-0.5 rounded-full ${badgeStyles[type] || "bg-slate-100 text-slate-700 border-slate-200"}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        <div className="text-xs text-(--text-secondary)">
          Papers scanned: {finding.papersScanned || 0}
        </div>

        <div className="space-y-2">
          {previewPapers.map((paper) => (
            <div
              key={paper.link + paper.title}
              className="flex items-start justify-between gap-3 rounded-lg bg-(--bg-secondary) px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-(--text-primary) truncate">
                  {paper.title}
                </p>
                <p className="text-xs text-(--text-tertiary) truncate">
                  {paper.authors?.join(", ")}
                </p>
              </div>
              <a
                href={paper.link}
                target="_blank"
                rel="noreferrer"
                className="text-(--accent-primary) hover:text-(--accent-primary)/80 shrink-0"
                aria-label="Open paper"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}

          {remainingCount > 0 && (
            <p className="text-xs text-(--text-tertiary)">
              {remainingCount} more new papers in this category.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
