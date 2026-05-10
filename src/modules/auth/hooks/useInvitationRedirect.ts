"use client";

import { useRouter } from "next/navigation";
import workspaceApi from "@/api/workspaceApi";

export default function useInvitationRedirect() {
  const router = useRouter();

  const handleInvitationRedirect = async () => {
    const {
      isInInvitationFlow,
      getInvitationToken,
      getPendingWorkspaceId,
      clearInvitationData,
    } = await import("@/utils/storage/invitationStorage");

    if (!isInInvitationFlow()) {
      return false;
    }

    const invitationToken = getInvitationToken();
    const workspaceId = getPendingWorkspaceId();

    if (!invitationToken || !workspaceId) {
      return false;
    }

    try {
      await workspaceApi.acceptInvite(invitationToken);
      router.push(`/workspace/${workspaceId}`);
      return true;
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      clearInvitationData();
      return false;
    }
  };

  return {
    handleInvitationRedirect,
  };
}
