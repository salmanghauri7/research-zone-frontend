"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useSocket } from "@/contexts/SocketContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  getRadarCategories,
  getRadarNotifications,
  startRadarRun,
} from "@/api/radarApi";
import useRadarSocket from "./useRadarSocket";
import {
  RadarCategoryDonePayload,
  RadarErrorPayload,
  RadarFinding,
} from "../types";

export type RadarStatus = "idle" | "running" | "complete";

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string }> & {
    customMessage?: string;
  };

  return (
    axiosError?.customMessage || axiosError?.response?.data?.message || fallback
  );
};

export default function useRadar() {
  const { socket } = useSocket();
  const { showError, showSuccess } = useNotification();
  const currentWorkspaceId = useWorkspaceStore(
    (state) => state.currentWorkspaceId,
  );

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [findings, setFindings] = useState<RadarFinding[]>([]);
  const [status, setStatus] = useState<RadarStatus>("idle");
  const [isStarting, setIsStarting] = useState(false);
  const [totalCategories, setTotalCategories] = useState(0);
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);

  const [previousAlerts, setPreviousAlerts] = useState<RadarFinding[]>([]);
  const [isLoadingPreviousAlerts, setIsLoadingPreviousAlerts] = useState(false);
  const [previousAlertsError, setPreviousAlertsError] = useState<string | null>(
    null,
  );

  const selectedCount = selectedCategories.length;
  const completedCount = completedCategories.length;

  const refreshCategories = useCallback(async () => {
    if (!currentWorkspaceId) return;

    setIsLoadingCategories(true);
    setCategoriesError(null);

    try {
      const data = await getRadarCategories(currentWorkspaceId);
      const list = data.categories || [];
      setCategories(list);
      setSelectedCategories(list);
    } catch (error) {
      setCategoriesError(
        getErrorMessage(error, "Failed to load radar categories."),
      );
    } finally {
      setIsLoadingCategories(false);
    }
  }, [currentWorkspaceId]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  }, []);

  const selectAllCategories = useCallback(() => {
    setSelectedCategories(categories);
  }, [categories]);

  const clearAllCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const startRun = useCallback(async () => {
    if (!currentWorkspaceId) {
      showError("No workspace selected.");
      return;
    }

    setIsStarting(true);

    try {
      const response = await startRadarRun(
        currentWorkspaceId,
        selectedCategories.length > 0 ? selectedCategories : undefined,
      );

      setFindings([]);
      setCompletedCategories([]);
      setActiveCategories(response.categories || []);
      setTotalCategories(response.total || 0);
      setStatus("running");
      showSuccess("Radar scan started.");
    } catch (error) {
      showError(
        getErrorMessage(error, "Failed to start radar scan. Please retry."),
      );
    } finally {
      setIsStarting(false);
    }
  }, [currentWorkspaceId, selectedCategories, showError, showSuccess]);

  const handleFinding = useCallback((finding: RadarFinding) => {
    setFindings((prev) => [finding, ...prev]);
  }, []);

  const handleCategoryDone = useCallback(
    (payload: RadarCategoryDonePayload) => {
      console.log("Category done:", payload);
      // setCompletedCategories((prev) =>
      //   prev.includes(payload.category) ? prev : [...prev, payload.category],
      // );
    },
    [],
  );

  const handleComplete = useCallback(() => {
    setStatus("complete");
    showSuccess("Radar scan completed.");
  }, [showSuccess]);

  const handleError = useCallback(
    (payload: RadarErrorPayload) => {
      setStatus("idle");
      setIsStarting(false);
      showError(payload.message || "Radar scan failed.");
    },
    [showError],
  );

  useRadarSocket({
    socket,
    workspaceId: currentWorkspaceId,
    onFinding: handleFinding,
    onCategoryDone: handleCategoryDone,
    onComplete: handleComplete,
    onError: handleError,
  });

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  useEffect(() => {
    if (!currentWorkspaceId) return;

    setIsLoadingPreviousAlerts(true);
    setPreviousAlertsError(null);

    const fetchNotifications = async () => {
      try {
        const data = await getRadarNotifications(currentWorkspaceId);
        setPreviousAlerts((data.items as unknown as RadarFinding[]) || []);
      } catch (error) {
        setPreviousAlertsError(
          getErrorMessage(
            error,
            "Failed to load previous radar notifications.",
          ),
        );
      } finally {
        setIsLoadingPreviousAlerts(false);
      }
    };

    fetchNotifications();
  }, [currentWorkspaceId]);

  const summary = useMemo(
    () => ({
      selectedCount,
      completedCount,
      findingsCount: findings.length,
    }),
    [selectedCount, completedCount, findings.length],
  );

  return {
    currentWorkspaceId,
    categories,
    selectedCategories,
    activeCategories,
    isLoadingCategories,
    categoriesError,
    status,
    isStarting,
    totalCategories,
    completedCategories,
    findings,
    previousAlerts,
    isLoadingPreviousAlerts,
    previousAlertsError,
    summary,
    refreshCategories,
    toggleCategory,
    selectAllCategories,
    clearAllCategories,
    startRun,
  };
}
