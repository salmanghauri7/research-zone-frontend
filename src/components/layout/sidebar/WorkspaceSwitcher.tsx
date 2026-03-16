"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Folder } from "lucide-react";
import workspaceApi from "@/api/workspaceApi";
import { useRouter } from "next/navigation";

interface Workspace {
  _id: string;
  title: string;
  isOwner: boolean;
  color: string;
}

interface WorkspaceSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
}

export default function WorkspaceSwitcher({
  isOpen,
  onClose,
  collapsed,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"owner" | "member">("owner");
  const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([]);
  const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
  const [memberWorkspaces, setMemberWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && allWorkspaces.length === 0) {
      fetchWorkspaces();
    }
  }, [isOpen, allWorkspaces.length]);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await workspaceApi.getWorkspaces();
      const workspaces = response.data.data || [];

      setAllWorkspaces(workspaces);

      // Filter workspaces after fetching
      const owned = workspaces.filter((ws: Workspace) => ws.isOwner);
      const member = workspaces.filter((ws: Workspace) => !ws.isOwner);

      setOwnedWorkspaces(owned);
      setMemberWorkspaces(member);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentWorkspaces =
    activeTab === "owner" ? ownedWorkspaces : memberWorkspaces;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed w-80 top-28 bg-[var(--bg-primary)] rounded-xl  z-50 border border-[var(--border-primary)] overflow-hidden ${
              collapsed ? "left-5" : "left-5"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10">
                  <Folder size={18} className="text-[var(--accent-primary)]" />
                </div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Workspaces
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-4 border-b border-[var(--border-primary)]">
              <button
                onClick={() => setActiveTab("owner")}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "owner"
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                My Workspaces
              </button>
              <button
                onClick={() => setActiveTab("member")}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "member"
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                Shared With Me
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : currentWorkspaces.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-secondary)] mb-3">
                    <Folder size={24} className="text-[var(--text-muted)]" />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {activeTab === "owner"
                      ? "No workspaces created yet"
                      : "No shared workspaces"}
                  </p>
                </div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-80 overflow-y-auto pr-1 space-y-2 custom-scrollbar"
                >
                  {currentWorkspaces.map((workspace) => (
                    <motion.div
                      key={workspace._id}
                      whileHover={{ x: 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      onClick={() => {
                        router.push(`/workspace/${workspace._id}`);
                        onClose();
                      }}
                      className="group relative pl-4 pr-3 py-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] cursor-pointer transition-all duration-200 border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30"
                    >
                      {/* Colored vertical line */}
                      <div
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-full transition-all duration-200 group-hover:w-1.5"
                        style={{ backgroundColor: workspace.color }}
                      />

                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors">
                            {workspace.title}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
