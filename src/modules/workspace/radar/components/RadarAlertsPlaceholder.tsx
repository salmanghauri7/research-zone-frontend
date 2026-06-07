"use client";

import { Archive, ExternalLink } from "lucide-react";
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
    <div className="h-full flex flex-col bg-(--bg-primary)">
      <div className="p-4 lg:p-6 flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center p-10 text-sm text-(--text-tertiary)">
            <Archive className="w-5 h-5 mr-3 animate-pulse text-(--text-secondary)" />{" "}
            Loading saved alerts...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 max-w-lg mx-auto mt-4 text-center">
            {error}
          </div>
        )}

        {!isLoading && !error && alerts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-(--border-secondary) bg-(--bg-secondary) p-10 mt-4 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 bg-(--border-secondary)/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="w-6 h-6 text-(--text-tertiary)" />
            </div>
            <p className="text-base font-semibold text-(--text-primary)">
              No saved alerts
            </p>
            <p className="text-sm text-(--text-tertiary) mt-2 max-w-sm mx-auto">
              Run a scan and save alerts to review them here later.
            </p>
          </div>
        )}

        {!isLoading && !error && alerts.length > 0 && (
          <div className="space-y-8 pb-8">
            {relevanceItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-(--border-primary) pb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h3 className="text-sm font-semibold text-(--text-primary)">
                    Saved Relevance Signals
                  </h3>
                  <span className="text-xs font-medium bg-(--bg-secondary) px-2 py-0.5 rounded-full text-(--text-secondary)">
                    {relevanceItems.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {relevanceItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex flex-col md:flex-row gap-4 items-start rounded-xl border border-(--border-primary) bg-(--bg-primary) hover:border-(--accent-primary)/50 p-4 transition-all shadow-sm hover:shadow"
                    >
                      <div className="flex-1 space-y-1 w-full">
                        <p className="text-sm font-semibold text-(--text-primary)">
                          {item.paper?.title}
                        </p>
                        <p className="text-xs text-(--text-tertiary) truncate">
                          {formatAuthors(item.paper?.authors)}
                        </p>
                        <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg text-xs leading-relaxed text-(--text-secondary)">
                          <span className="font-medium text-blue-700 dark:text-blue-400 mr-2">
                            Why it matters:
                          </span>
                          {item.explanation}
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-end w-full md:w-auto shrink-0 md:pl-4 md:border-l border-t md:border-t-0 border-(--border-secondary) pt-3 md:pt-0 mt-3 md:mt-0">
                        <a
                          href={item.paper?.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center h-8 px-4 text-xs font-medium rounded-md bg-(--bg-secondary) text-(--text-primary) hover:bg-(--border-secondary) transition-colors w-full md:w-auto"
                        >
                          Read <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contradictionItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-(--border-primary) pb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <h3 className="text-sm font-semibold text-(--text-primary)">
                    Saved Contradictions
                  </h3>
                  <span className="text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded-full">
                    {contradictionItems.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {contradictionItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex flex-col md:flex-row gap-4 items-start rounded-xl border-l-4 border-rose-500 border border-(--border-primary) bg-(--bg-primary) p-4 transition-all shadow-sm hover:shadow"
                    >
                      <div className="flex-1 space-y-3 w-full">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-(--text-primary)">
                            {item.paper?.title}
                          </p>
                          <p className="text-xs text-(--text-tertiary) truncate">
                            {formatAuthors(item.paper?.authors)}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 p-3 bg-rose-50/50 dark:bg-rose-900/10 rounded-lg w-full">
                          {item.savedPaperTitle && (
                            <div className="text-xs border-b border-rose-100 dark:border-rose-800/30 pb-2 mb-1">
                              <span className="font-semibold text-rose-700 dark:text-rose-400 block mb-0.5">
                                Conflicts with:
                              </span>
                              <span className="text-(--text-secondary) italic">
                                "{item.savedPaperTitle}"
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-end w-full md:w-auto shrink-0 md:pl-4 md:border-l border-t md:border-t-0 border-(--border-secondary) pt-3 md:pt-0 mt-3 md:mt-0">
                        <a
                          href={item.paper?.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center h-8 px-4 text-xs font-medium rounded-md bg-(--bg-secondary) text-(--text-primary) hover:bg-(--border-secondary) transition-colors w-full md:w-auto"
                        >
                          Read <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
