"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import workspaceDashboardApi, {
  type ActivityPoint,
  type WorkspaceDashboardData,
} from "@/api/workspaceDashboardApi";

const DEFAULT_ACTIVITY_DATA: ActivityPoint[] = [
  { day: "Mon", value: 0 },
  { day: "Tue", value: 0 },
  { day: "Wed", value: 0 },
  { day: "Thu", value: 0 },
  { day: "Fri", value: 0 },
  { day: "Sat", value: 0 },
  { day: "Sun", value: 0 },
];

export default function useWorkspaceDashboard() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.id as string;

  const [data, setData] = useState<WorkspaceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!workspaceId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await workspaceDashboardApi.getDashboard(workspaceId);
      setData(result);
    } catch (err) {
      console.error("Failed to load workspace dashboard:", err);
      setError("Failed to load workspace dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const activityData = useMemo(
    () =>
      data?.activityData?.length ? data.activityData : DEFAULT_ACTIVITY_DATA,
    [data],
  );

  const handleRetry = useCallback(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleOpenSearchPapers = useCallback(() => {
    if (!workspaceId) {
      return;
    }
    router.push(`/workspace/${workspaceId}/search-papers`);
  }, [router, workspaceId]);

  const handleOpenInviteModal = useCallback(() => {
    if (!workspaceId) {
      return;
    }
    setIsInviteModalOpen(true);
  }, [workspaceId]);

  const handleCloseInviteModal = useCallback(() => {
    setIsInviteModalOpen(false);
  }, []);

  const handleOpenSavedPapers = useCallback((paperId?: string) => {
    if (!workspaceId) {
      return;
    }

    if (paperId) {
      const query = new URLSearchParams({ highlightPaper: paperId });
      router.push(`/workspace/${workspaceId}/saved-papers?${query.toString()}`);
      return;
    }

    router.push(`/workspace/${workspaceId}/saved-papers`);
  }, [router, workspaceId]);

  return {
    workspaceId,
    data,
    loading,
    error,
    activityData,
    isInviteModalOpen,
    handleRetry,
    handleOpenSearchPapers,
    handleOpenInviteModal,
    handleCloseInviteModal,
    handleOpenSavedPapers,
  };
}
