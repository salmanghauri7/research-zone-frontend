"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Home,
  AlertCircle,
} from "lucide-react";
import {
  getFolderTree,
  savePaper,
  FolderTreeNode,
  SavePaperData,
} from "@/api/papersApi";
import { paper } from "./workspace/types";

interface SavePaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: paper | null;
  workspaceId: string | null;
  onSuccess?: () => void;
}

// Recursive folder tree item component
function FolderTreeItem({
  folder,
  selectedFolderId,
  onSelect,
  level = 0,
}: {
  folder: FolderTreeNode;
  selectedFolderId: string | null;
  onSelect: (folderId: string) => void;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder._id;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(folder._id)}
      >
        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Folder icon */}
        {isExpanded && hasChildren ? (
          <FolderOpen className="w-4 h-4 text-teal-500 shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-teal-500 shrink-0" />
        )}

        {/* Folder name */}
        <span className="text-sm truncate">{folder.name}</span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child) => (
            <FolderTreeItem
              key={child._id}
              folder={child}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SavePaperModal({
  isOpen,
  onClose,
  paper,
  workspaceId,
  onSuccess,
}: SavePaperModalProps) {
  const [title, setTitle] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderTree, setFolderTree] = useState<FolderTreeNode[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset state when modal opens with new paper
  useEffect(() => {
    if (isOpen && paper) {
      setTitle(paper.title);
      setSelectedFolderId(null);
      setError("");
    }
  }, [isOpen, paper]);

  // Fetch folder tree when modal opens
  useEffect(() => {
    if (isOpen && workspaceId) {
      fetchFolderTree(workspaceId);
    } else {
      setFolderTree([]);
    }
  }, [isOpen, workspaceId]);

  const fetchFolderTree = async (workspaceId: string) => {
    setIsLoadingFolders(true);
    setSelectedFolderId(null);
    try {
      const tree = await getFolderTree(workspaceId);
      setFolderTree(tree);
    } catch (err) {
      console.error("Error fetching folder tree:", err);
      setFolderTree([]);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Paper title is required");
      return;
    }

    if (!workspaceId) {
      setError("No workspace selected");
      return;
    }

    if (!paper) return;

    setIsSaving(true);
    setError("");

    try {
      const saveData: SavePaperData = {
        workspaceId: workspaceId,
        folderId: selectedFolderId,
        title: title.trim(),
        link: paper.link,
        authors: paper.authors,
        published: paper.published,
      };

      await savePaper(saveData);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error saving paper:", err);
      setError("Failed to save paper. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectRoot = useCallback(() => {
    setSelectedFolderId(null);
  }, []);

  if (!paper) return null;

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-500/10">
                    <Bookmark className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Save Paper
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Save to your research library
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Error message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Paper Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Paper Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter paper title"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
                    disabled={isSaving}
                  />
                </div>

                {/* Folder Tree */}
                {workspaceId && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Select Folder
                    </label>
                    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
                      {isLoadingFolders ? (
                        <div className="flex items-center justify-center gap-2 p-6 text-sm text-zinc-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading folders...
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto p-2">
                          {/* Root option */}
                          <div
                            className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                              selectedFolderId === null
                                ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            }`}
                            onClick={handleSelectRoot}
                          >
                            <Home className="w-4 h-4 text-teal-500" />
                            <span className="text-sm font-medium">
                              Root (No folder)
                            </span>
                          </div>

                          {/* Folder tree */}
                          {folderTree.length > 0 ? (
                            <div className="mt-1 border-t border-zinc-200 dark:border-zinc-700 pt-2">
                              {folderTree.map((folder) => (
                                <FolderTreeItem
                                  key={folder._id}
                                  folder={folder}
                                  selectedFolderId={selectedFolderId}
                                  onSelect={setSelectedFolderId}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-sm text-zinc-400">
                              No folders in this workspace
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">
                      {selectedFolderId
                        ? "Paper will be saved to the selected folder"
                        : "Paper will be saved to workspace root"}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !workspaceId || !title.trim()}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Paper"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
