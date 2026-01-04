"use client"
import { useEffect } from "react";
import { useParams } from "next/navigation";
import WorkSpace from "@/components/dashboard/workspace/WorkSpace";
import { clearInvitationData, getPendingWorkspaceId } from "@/utils/invitationStorage";

export default function page() {
    const params = useParams();
    const workspaceId = params.id as string;

    useEffect(() => {
        // Clean up invitation data if this is the workspace user was invited to
        const pendingWorkspaceId = getPendingWorkspaceId();

        if (pendingWorkspaceId === workspaceId) {
            clearInvitationData();
        }
    }, [workspaceId]);

    return (
        <div>
            <WorkSpace />
        </div>
    )
}