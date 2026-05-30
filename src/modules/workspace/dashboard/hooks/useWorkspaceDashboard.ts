"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";
import { WORKSPACE_DASHBOARD_QUERY } from "@/graphql/queries/dashboard";
import type {
  ActivityPoint,
  WorkspaceDashboardData,
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
  const fetchInitiated = useRef(false);

  const fetchDashboard = useCallback(async (forceRefetch = false) => {
    if (!workspaceId) {
      return;
    }
    
    // Prevent double fetch on mount (React StrictMode), unless forced (e.g. retry button)
    if (fetchInitiated.current && !forceRefetch) return;
    fetchInitiated.current = true;

    setLoading(true);
    setError(null);

    try {
      const result = await graphqlRequest<{
        workspaceDashboard: WorkspaceDashboardData;
      }>(WORKSPACE_DASHBOARD_QUERY, { workspaceId });
      
      setData(result.workspaceDashboard);
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
    void fetchDashboard(true);
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
