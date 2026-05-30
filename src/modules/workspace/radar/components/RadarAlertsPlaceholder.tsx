"use client";

import { Archive } from "lucide-react";
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
      </CardContent>
    </Card>
  );
}
