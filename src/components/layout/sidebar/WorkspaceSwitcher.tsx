"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import workspaceApi from "@/api/workspaceApi";

interface Workspace {
    _id: string;
    title: string;
    owner?: {
        _id: string;
        name: string;
    };
    createdAt?: string;
}

interface WorkspaceSwitcherProps {
    isOpen: boolean;
    onClose: () => void;
    collapsed: boolean;
}

export default function WorkspaceSwitcher({ isOpen, onClose, collapsed }: WorkspaceSwitcherProps) {
    const [activeTab, setActiveTab] = useState<"owner" | "member">("owner");
    const [ownedWorkspaces, setOwnedWorkspaces] = useState<Workspace[]>([]);
    const [memberWorkspaces, setMemberWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchWorkspaces();
        }
    }, [isOpen]);

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            // Fetch workspaces where user is owner
            const ownerResponse = await workspaceApi.getOwnerWorkspaces();
            setOwnedWorkspaces(ownerResponse.data.workspaces || []);

            // TODO: Add API call for workspaces where user is a member
            // const memberResponse = await workspaceApi.getMemberWorkspaces();
            // setMemberWorkspaces(memberResponse.data.workspaces || []);
            setMemberWorkspaces([]); // Placeholder
        } catch (error) {
            console.error("Error fetching workspaces:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentWorkspaces = activeTab === "owner" ? ownedWorkspaces : memberWorkspaces;

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
                        className={`fixed w-72 top-28 bg-white dark:bg-black rounded-lg shadow-2xl z-50 border border-gray-200 dark:border-white/10 transition-all duration-300 ${collapsed ? "left-5" : "left-5"
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
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === "owner"
                                    ? "bg-blue-500 text-white shadow-md"
                                    : "bg-gray-100 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10"
                                    }`}
                            >
                                I'm Owner
                            </button>
                            <button
                                onClick={() => setActiveTab("member")}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === "member"
                                    ? "bg-blue-500 text-white shadow-md"
                                    : "bg-gray-100 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10"
                                    }`}
                            >
                                I'm Member
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : currentWorkspaces.length === 0 ? (
                                <div className="text-center py-8 text-black/50 dark:text-white/50">
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
                                    className="space-y-2"
                                >
                                    {currentWorkspaces.map((workspace) => (
                                        <motion.div
                                            key={workspace._id}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-blue-500/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                                                    {workspace.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-black dark:text-white truncate">
                                                        {workspace.title}
                                                    </h3>
                                                    {workspace.owner && activeTab === "member" && (
                                                        <p className="text-xs text-black/50 dark:text-white/50 truncate">
                                                            Owner: {workspace.owner.name}
                                                        </p>
                                                    )}
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
