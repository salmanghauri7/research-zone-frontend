"use client";

import { useEffect, useState, memo, useCallback, useMemo } from "react";
import { ChevronRight, Folder, Plus } from "lucide-react";
import Link from "next/link";
import workspaceApi from "@/api/workspaceApi";
import { useModal } from "@/contexts/ModalContext";

interface Workspace {
  _id: string;
  title: string;
  isOwner: boolean;
  color: string;
}

// Memoize the workspace list item
const WorkspaceItem = memo(function WorkspaceItem({
  workspace,
}: {
  workspace: Workspace;
}) {
  return (
    <Link
      href={`/workspace/${workspace._id}`}
      prefetch={true}
      className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all duration-200"
    >
      {/* Color accent indicator */}
      <div
        style={{ backgroundColor: workspace.color }}
        className="w-1 h-8 rounded-full shrink-0"
      />

      {/* Folder icon */}
      <div
        style={{ backgroundColor: workspace.color }}
        className="p-2 rounded-lg text-white shrink-0"
      >
        <Folder size={16} />
      </div>

      {/* Workspace title */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors">
          {workspace.title}
        </h3>
      </div>

      {/* Arrow icon */}
      <ChevronRight
        size={16}
        className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors shrink-0"
      />
    </Link>
  );
});

const ActiveWorkspaces = memo(function ActiveWorkspaces() {
  const [showAllOwned, setShowAllOwned] = useState(false);
  const [showAllMember, setShowAllMember] = useState(false);
  const [ownerWorkspaces, setOwnerWorkspaces] = useState<Workspace[]>([]);
  const [memberWorkspaces, setMemberWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    let isMounted = true;

    const fetchWorkspaces = async () => {
      try {
        const response = await workspaceApi.getWorkspaces();
        const workspaces = response.data.data || [];

        if (isMounted) {
          // Filter workspaces based on isOwner flag
          const owned = workspaces.filter((ws: Workspace) => ws.isOwner);
          const member = workspaces.filter((ws: Workspace) => !ws.isOwner);

          setOwnerWorkspaces(owned);
          setMemberWorkspaces(member);
        }
      } catch (error) {
        console.error("failed to fetch workspaces:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWorkspaces();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleShowAllOwned = useCallback(() => {
    setShowAllOwned((prev) => !prev);
  }, []);

  const toggleShowAllMember = useCallback(() => {
    setShowAllMember((prev) => !prev);
  }, []);

  const displayedOwnedWorkspaces = useMemo(
    () => (showAllOwned ? ownerWorkspaces : ownerWorkspaces.slice(0, 5)),
    [showAllOwned, ownerWorkspaces],
  );

  const displayedMemberWorkspaces = useMemo(
    () => (showAllMember ? memberWorkspaces : memberWorkspaces.slice(0, 5)),
    [showAllMember, memberWorkspaces],
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-primary)]"
          >
            <div className="space-y-2 mb-6">
              <div className="h-6 w-40 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="h-14 bg-[var(--bg-tertiary)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Your Workspaces (Owner) */}
      <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-primary)]">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Your Workspaces
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {ownerWorkspaces.length} workspace
            {ownerWorkspaces.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Workspaces List */}
        {ownerWorkspaces.length > 0 ? (
          <>
            <div className="space-y-2">
              {displayedOwnedWorkspaces.map((workspace) => (
                <WorkspaceItem key={workspace._id} workspace={workspace} />
              ))}
            </div>

            {/* Show All Button */}
            {ownerWorkspaces.length > 5 && (
              <button
                onClick={toggleShowAllOwned}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] text-sm font-medium"
              >
                {showAllOwned ? (
                  <>Show Less</>
                ) : (
                  <>Show All ({ownerWorkspaces.length})</>
                )}
              </button>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--bg-secondary)] mb-3">
              <Folder size={24} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              No workspaces yet
            </p>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white font-medium text-sm rounded-lg transition-colors"
            >
              <Plus size={16} />
              Create Workspace
            </button>
          </div>
        )}
      </div>

      {/* Shared With Me (Member) */}
      <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-primary)]">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Shared With Me
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {memberWorkspaces.length} workspace
            {memberWorkspaces.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Workspaces List */}
        {memberWorkspaces.length > 0 ? (
          <>
            <div className="space-y-2">
              {displayedMemberWorkspaces.map((workspace) => (
                <WorkspaceItem key={workspace._id} workspace={workspace} />
              ))}
            </div>

            {/* Show All Button */}
            {memberWorkspaces.length > 5 && (
              <button
                onClick={toggleShowAllMember}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] text-sm font-medium"
              >
                {showAllMember ? (
                  <>Show Less</>
                ) : (
                  <>Show All ({memberWorkspaces.length})</>
                )}
              </button>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--bg-secondary)] mb-3">
              <Folder size={24} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              No shared workspaces yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ActiveWorkspaces;
