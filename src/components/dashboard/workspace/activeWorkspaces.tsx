"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Folder, Users, Clock } from "lucide-react";
import Link from "next/link";
import workspaceApi from "@/api/workspaceApi";
import { useSideBar } from "@/contexts/SidebarContext";
import { useModal } from "@/contexts/ModalContext";

interface Workspace {
  _id: string;
  title: string;
  owner: string;
  members: number;
  createdAt: string;
  color: string;
}

export default function ActiveWorkspaces() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ownerWorkspaces, setOwnerWorkspaces] = useState<Workspace[]>([]);
  const { setHasWorkspaces } = useSideBar();
  const { openModal } = useModal();

  useEffect(() => {
    (async () => {
      try {
        const response = await workspaceApi.getOwnerWorkspaces();
        const workspaces = response.data.data;
        setOwnerWorkspaces(workspaces);
        setHasWorkspaces(workspaces.length > 0);
      } catch (error) {
        console.error("failed to fetch ", error);
        setHasWorkspaces(false);
      }
    })();
  }, [setHasWorkspaces]);

  const displayedWorkspaces = isExpanded
    ? ownerWorkspaces
    : ownerWorkspaces.slice(0, 4);

  return (
    <div className="bg-white dark:bg-(--bg-card-dark) rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Workspaces
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {ownerWorkspaces.length} workspace
            {ownerWorkspaces.length !== 1 ? "s" : ""} available
          </p>
        </div>
        {ownerWorkspaces.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={18} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={18} />
                Show All
              </>
            )}
          </button>
        )}
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedWorkspaces.map((workspace) => (
          <Link
            key={workspace._id}
            href={`/workspace/${workspace._id}`}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-md"
          >
            <div className="p-5 bg-linear-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-all">
              {/* Color accent bar */}
              <div
                style={{ backgroundColor: workspace.color }}
                className={`absolute top-0 left-0 w-1 h-full bg-[${workspace.color}]`}
              />

              {/* Icon and Name */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  style={{ backgroundColor: workspace.color }}
                  className={`bg-[${workspace.color}] p-2.5 rounded-xl text-white shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Folder size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {workspace.title}
                  </h3>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 ml-12">
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{workspace.members} members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{workspace.createdAt}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {ownerWorkspaces.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Folder size={32} className="text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No workspaces yet
          </p>
          <button
            onClick={openModal}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
          >
            Create Your First Workspace
          </button>
        </div>
      )}
    </div>
  );
}
