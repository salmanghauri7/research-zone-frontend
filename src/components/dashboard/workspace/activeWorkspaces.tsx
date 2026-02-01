"use client";

import { useEffect, useState, memo, useCallback, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Folder,
  Users,
  Clock,
  Plus,
} from "lucide-react";
import Link from "next/link";
import workspaceApi from "@/api/workspaceApi";
import { useModal } from "@/contexts/ModalContext";

interface Workspace {
  _id: string;
  title: string;
  owner: string;
  members: number;
  createdAt: string;
  color: string;
}

// Memoize the workspace card to prevent re-renders
const WorkspaceCard = memo(function WorkspaceCard({
  workspace,
}: {
  workspace: Workspace;
}) {
  return (
    <Link
      href={`/workspace/${workspace._id}`}
      prefetch={true}
      className="group relative overflow-hidden rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all duration-200 hover-lift"
    >
      <div className="p-5">
        {/* Color accent bar */}
        <div
          style={{ backgroundColor: workspace.color }}
          className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
        />

        {/* Icon and Name */}
        <div className="flex items-start gap-3 mb-3">
          <div
            style={{ backgroundColor: workspace.color }}
            className="p-2.5 rounded-xl text-white shrink-0 group-hover:scale-105 transition-transform"
          >
            <Folder size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm truncate group-hover:text-[var(--accent-primary)] transition-colors">
              {workspace.title}
            </h3>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] ml-11">
          <div className="flex items-center gap-1.5">
            <Users size={13} />
            <span>{workspace.members} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} />
            <span>{workspace.createdAt}</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

const ActiveWorkspaces = memo(function ActiveWorkspaces() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ownerWorkspaces, setOwnerWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    let isMounted = true;

    const fetchWorkspaces = async () => {
      try {
        const response = await workspaceApi.getOwnerWorkspaces();
        if (isMounted) {
          setOwnerWorkspaces(response.data.data || []);
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

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const displayedWorkspaces = useMemo(
    () => (isExpanded ? ownerWorkspaces : ownerWorkspaces.slice(0, 4)),
    [isExpanded, ownerWorkspaces],
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-primary)]">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-[var(--bg-tertiary)] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Your Workspaces
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {ownerWorkspaces.length} workspace
            {ownerWorkspaces.length !== 1 ? "s" : ""} available
          </p>
        </div>
        {ownerWorkspaces.length > 4 && (
          <button
            onClick={toggleExpand}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] text-sm font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show All
              </>
            )}
          </button>
        )}
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedWorkspaces.map((workspace) => (
          <WorkspaceCard key={workspace._id} workspace={workspace} />
        ))}
      </div>

      {/* Empty State */}
      {ownerWorkspaces.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] mb-4">
            <Folder size={28} className="text-[var(--text-muted)]" />
          </div>
          <p className="text-[var(--text-muted)] mb-4">No workspaces yet</p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white font-medium rounded-xl transition-colors"
          >
            <Plus size={18} />
            Create Your First Workspace
          </button>
        </div>
      )}
    </div>
  );
});

export default ActiveWorkspaces;
