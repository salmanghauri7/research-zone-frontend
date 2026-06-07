"use client";

import { Archive, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { RadarFinding } from "../types";

interface RadarAlertsPlaceholderProps {
  alerts: RadarFinding[];
  isLoading: boolean;
  error?: string | null;
}

export default function RadarAlertsPlaceholder({
  alerts,
  isLoading,
  error,
}: RadarAlertsPlaceholderProps) {
  const formatAuthors = (authors?: string[] | string) =>
    Array.isArray(authors) ? authors.join(", ") : authors || "";
  const items = alerts
    .map((finding, index) => {
      const alertTypes = Array.isArray(finding.alertType)
        ? finding.alertType
        : [finding.alertType];
      const isContradiction = alertTypes.includes("contradiction");
      const paper = finding.newPapers?.[0];
      const explanation = isContradiction
        ? finding.contradictionDetail?.explanation ||
          "This paper appears to conflict with a claim in your saved work."
        : finding.relevanceExplanation ||
          "This paper aligns with topics in your saved library.";

      return {
        id: finding._id || paper?.link || `${finding.category}-${index}`,
        type: isContradiction ? "contradiction" : "relevance",
        paper,
        explanation,
        savedPaperTitle: finding.contradictionDetail?.savedPaperTitle,
      };
    })
    .filter((item) => item.paper);

  const relevanceItems = items.filter((item) => item.type === "relevance");
  const contradictionItems = items.filter(
    (item) => item.type === "contradiction",
  );

  return (
    <Card className="rounded-2xl border border-(--border-primary)">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold text-(--text-primary) flex items-center gap-2">
          <Archive className="w-4 h-4 text-(--accent-primary)" />
          Previous Radar Alerts
        </CardTitle>
        <p className="text-xs text-(--text-tertiary)">
          Your saved radar notifications appear here for quick review.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="rounded-xl border border-dashed border-(--border-secondary) bg-(--bg-secondary) p-4 text-sm text-(--text-tertiary)">
            Loading alerts...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!isLoading && !error && alerts.length === 0 && (
          <div className="rounded-xl border border-dashed border-(--border-secondary) bg-(--bg-secondary) p-4 text-sm text-(--text-tertiary)">
            No stored alerts yet. Run a scan to populate your Radar feed.
          </div>
        )}

        {!isLoading && !error && alerts.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-(--text-secondary)">
                <span>Relevance ({relevanceItems.length})</span>
              </div>
              {relevanceItems.length === 0 ? (
                <p className="text-xs text-(--text-tertiary)">
                  No relevant papers saved yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {relevanceItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-(--border-secondary) bg-(--bg-secondary) px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-(--text-primary) truncate">
                            {item.paper?.title}
                          </p>
                          <p className="text-xs text-(--text-tertiary) truncate">
                            {formatAuthors(item.paper?.authors)}
                          </p>
                        </div>
                        <a
                          href={item.paper?.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-(--accent-primary) hover:text-(--accent-primary)/80 shrink-0"
                          aria-label="Open paper"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="text-xs text-(--text-secondary) mt-2">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-(--text-secondary)">
                <span>Contradictions ({contradictionItems.length})</span>
              </div>
              {contradictionItems.length === 0 ? (
                <p className="text-xs text-(--text-tertiary)">
                  No contradictions saved yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {contradictionItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-(--border-secondary) bg-(--bg-secondary) px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-(--text-primary) truncate">
                            {item.paper?.title}
                          </p>
                          <p className="text-xs text-(--text-tertiary) truncate">
                            {formatAuthors(item.paper?.authors)}
                          </p>
                        </div>
                        <a
                          href={item.paper?.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-(--accent-primary) hover:text-(--accent-primary)/80 shrink-0"
                          aria-label="Open paper"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      {item.savedPaperTitle && (
                        <p className="text-[11px] text-(--text-tertiary) mt-2">
                          Conflicts with: {item.savedPaperTitle}
                        </p>
                      )}
                      <p className="text-xs text-(--text-secondary) mt-1">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
