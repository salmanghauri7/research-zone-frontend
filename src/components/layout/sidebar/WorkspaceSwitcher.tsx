"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import workspaceApi from "@/api/workspaceApi";
import { Router } from "lucide-react";
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
            className="fixed inset-0 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed w-72 top-28 bg-white dark:bg-black rounded-lg shadow-2xl z-50 border border-gray-200 dark:border-white/10 transition-all duration-300 ${
              collapsed ? "left-5" : "left-5"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Workspaces
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-white/10">
              <button
                onClick={() => setActiveTab("owner")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "owner"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                I'm Owner
              </button>
              <button
                onClick={() => setActiveTab("member")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "member"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                I'm Member
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : currentWorkspaces.length === 0 ? (
                <div className="text-center py-12 text-black/50 dark:text-white/50">
                  <p className="text-sm">
                    {activeTab === "owner"
                      ? "You don't own any workspaces yet"
                      : "You're not a member of any workspaces yet"}
                  </p>
                </div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-80 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-white/30"
                >
                  {currentWorkspaces.map((workspace) => (
                    <motion.div
                      key={workspace._id}
                      whileHover={{ x: 4 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="group relative pl-4 pr-3 py-3.5 rounded-lg bg-gray-50/50 dark:bg-white/[0.03] hover:bg-gray-100/80 dark:hover:bg-white/[0.08] cursor-pointer transition-all duration-200 border border-gray-200/50 dark:border-white/[0.08] hover:border-gray-300/80 dark:hover:border-white/20 hover:shadow-sm"
                    >
                      {/* Colored vertical line */}
                      <div
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-full transition-all duration-200 group-hover:w-1.5"
                        style={{ backgroundColor: workspace.color }}
                      />

                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-medium text-sm text-black dark:text-white truncate group-hover:text-black dark:group-hover:text-white transition-colors"
                            onClick={() =>
                              router.push(`/workspace/${workspace._id}`)
                            }
                          >
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
