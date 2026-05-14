"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspaceStore";
import workspaceApi from "@/api/workspaceApi";
import { toast } from "sonner";

export default function useWorkspaceSettings() {
  const router = useRouter();
  const { currentWorkspaceId, isOwner, workspaceTitle } =
    useWorkspaceStore();
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLeaveWorkspace = useCallback(async () => {
    if (!currentWorkspaceId) return;

    setIsLeaving(true);
    try {
      await workspaceApi.leaveWorkspace(currentWorkspaceId);
      toast.success(
        `Workspace ${isOwner ? "deleted" : "left"} successfully`,
      );
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to leave workspace:", error);
      toast.error("Failed to leave workspace. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  }, [currentWorkspaceId, isOwner, router]);

  const handleShowConfirmation = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  return {
    currentWorkspaceId,
    isOwner,
    workspaceTitle,
    isLeaving,
    showConfirmation,
    handleLeaveWorkspace,
    handleShowConfirmation,
    handleCancelConfirmation,
  };
}
