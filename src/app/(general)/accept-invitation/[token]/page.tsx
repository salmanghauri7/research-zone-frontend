"use client";

import { useParams } from "next/navigation";
import { AcceptInvitationPage as WorkspaceAcceptInvitationPage } from "@/modules/workspace/accept-invitation/components";

export default function AcceptInvitationPage() {
  const params = useParams();
  const token = params.token as string;

  return <WorkspaceAcceptInvitationPage token={token} />;
}
