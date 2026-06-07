"use client";

import { useState } from "react";
import {
  Activity,
  BookmarkPlus,
  Check,
  ExternalLink,
  Radar as RadarIcon,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { saveRadarNotification } from "@/api/radarApi";
import { useNotification } from "@/contexts/NotificationContext";
import { useWorkspaceStore } from "@/store/workspaceStore";
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
  const { showError, showSuccess } = useNotification();
  const currentWorkspaceId = useWorkspaceStore(
    (state) => state.currentWorkspaceId,
  );
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const formatAuthors = (authors?: string[] | string) =>
    Array.isArray(authors) ? authors.join(", ") : authors || "";
  const hasFindings = findings.length > 0;
  const items = findings
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
        finding,
      };
    })
    .filter((item) => item.paper);

  const relevanceItems = items.filter((item) => item.type === "relevance");
  const contradictionItems = items.filter(
    (item) => item.type === "contradiction",
  );

  const handleSaveFinding = async (item: (typeof items)[number]) => {
    if (!currentWorkspaceId) {
      showError("Select a workspace before saving this alert.");
      return;
    }

    const finding = item.finding;
    if (!finding) {
      showError("This alert could not be saved right now.");
      return;
    }

    try {
      setSavingIds((prev) => ({ ...prev, [item.id]: true }));

      await saveRadarNotification({
        workspaceId: currentWorkspaceId,
        category: finding.category,
        alertType: finding.alertType,
        papersScanned: finding.papersScanned,
        newPapers: finding.newPapers || [],
        relevanceExplanation: finding.relevanceExplanation,
        contradictionDetail: finding.contradictionDetail,
        confidence: finding.confidence,
      });

      setSavedIds((prev) =>
        prev.includes(item.id) ? prev : [...prev, item.id],
      );
      showSuccess("Alert saved successfully.");
    } catch (error) {
      console.error("Failed to save radar alert:", error);
      showError("Unable to save this alert. Please try again.");
    } finally {
      setSavingIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  return (
    <Card className="rounded-2xl border border-(--border-primary) h-full ">
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
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-(--text-secondary)">
                <span>Relevance ({relevanceItems.length})</span>
              </div>
              {relevanceItems.length === 0 ? (
                <p className="text-xs text-(--text-tertiary)">
                  No relevant papers detected yet.
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
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-(--accent-primary) hover:bg-(--bg-primary)"
                            onClick={() => handleSaveFinding(item)}
                            disabled={
                              savingIds[item.id] || savedIds.includes(item.id)
                            }
                            aria-label="Save this alert"
                          >
                            {savedIds.includes(item.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <BookmarkPlus className="h-4 w-4" />
                            )}
                          </Button>
                          <a
                            href={item.paper?.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--accent-primary) hover:text-(--accent-primary)/80"
                            aria-label="Open paper"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
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
                  No contradictions detected yet.
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
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-(--accent-primary) hover:bg-(--bg-primary)"
                            onClick={() => handleSaveFinding(item)}
                            disabled={
                              savingIds[item.id] || savedIds.includes(item.id)
                            }
                            aria-label="Save this alert"
                          >
                            {savedIds.includes(item.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <BookmarkPlus className="h-4 w-4" />
                            )}
                          </Button>
                          <a
                            href={item.paper?.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--accent-primary) hover:text-(--accent-primary)/80"
                            aria-label="Open paper"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
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
