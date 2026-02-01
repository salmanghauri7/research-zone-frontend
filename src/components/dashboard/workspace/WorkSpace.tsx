"use client";

import { useState, useEffect, memo, useCallback, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import { saveCurrentWorkspaceId } from "@/utils/invitationStorage";

// Lazy load the modal since it's not always needed
const InviteModal = lazy(() => import("./InviteModal"));

const WorkSpace = memo(function WorkSpace() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // get the workspace id from params
  const { id } = useParams();

  // Use useEffect to set workspaceId only once when component mounts or id changes
  useEffect(() => {
    if (id) {
      setWorkspaceId(id as string);
      // Save to localStorage for sidebar navigation
      saveCurrentWorkspaceId(id as string);
    }
  }, [id]);

  const handleSendInvite = useCallback((email: string, description: string) => {
    // TODO: Implement send invite logic here
    console.log("Sending invite to:", email, "with description:", description);
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="text-black dark:text-white">
      <h1>this is workspace page</h1>
      <button
        onClick={openModal}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Invite for workspace
      </button>

      {workspaceId && isModalOpen && (
        <Suspense fallback={null}>
          <InviteModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSendInvite={handleSendInvite}
            workspaceId={workspaceId}
          />
        </Suspense>
      )}
    </div>
  );
});

export default WorkSpace;
