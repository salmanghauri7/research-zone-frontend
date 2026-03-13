"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder as FolderIcon,
  FileText,
  ChevronRight,
  Home,
  ArrowLeft,
  Search,
  Calendar,
  User,
  Loader2,
  X,
} from "lucide-react";
import { folderApi } from "@/api/foldersApi";
import {
  Paper,
  Folder,
  FolderItem,
  BreadcrumbItem,
} from "@/components/saved-papers/types";

interface PaperPickerProps {
  workspaceId: string;
  onSelect: (paper: Paper) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function PaperPicker({
  workspaceId,
  onSelect,
  onClose,
  isOpen,
}: PaperPickerProps) {
  const [items, setItems] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const cacheRef = useRef<Map<string, FolderItem[]>>(new Map());
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchFolderContents = useCallback(async () => {
    try {
      setIsLoading(true);
      const cacheKey = currentFolderId || "root";

      if (cacheRef.current.has(cacheKey)) {
        setItems(cacheRef.current.get(cacheKey)!);
        setIsLoading(false);
        return;
      }

      const data = await folderApi.getFolderContents(
        workspaceId,
        currentFolderId,
      );
      cacheRef.current.set(cacheKey, data);
      setItems(data);
    } catch {
      console.error("Error fetching folder contents");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, currentFolderId]);

  const fetchBreadcrumbs = useCallback(async () => {
    if (!currentFolderId) {
      setBreadcrumbs([]);
      return;
    }
    try {
      const path = await folderApi.getFolderPath(currentFolderId);
      setBreadcrumbs(path);
    } catch {
      console.error("Error fetching breadcrumbs");
    }
  }, [currentFolderId]);

  useEffect(() => {
    if (isOpen) {
      fetchFolderContents();
      fetchBreadcrumbs();
    }
  }, [isOpen, fetchFolderContents, fetchBreadcrumbs]);

  const handleNavigateToFolder = (folder: Folder) => {
    setCurrentFolderId(folder._id);
    setSearchQuery("");
  };

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    setCurrentFolderId(item.id);
    setSearchQuery("");
  };

  const handleGoBack = () => {
    if (breadcrumbs.length > 1) {
      setCurrentFolderId(breadcrumbs[breadcrumbs.length - 2].id);
    } else {
      setCurrentFolderId(null);
    }
    setSearchQuery("");
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a.itemType === "folder" && b.itemType === "paper") return -1;
    if (a.itemType === "paper" && b.itemType === "folder") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredItems = searchQuery
    ? sortedItems.filter((item) => {
        const name = item.itemType === "folder" ? item.name : item.title;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : sortedItems;

  const folders = filteredItems.filter(
    (item): item is Folder => item.itemType === "folder",
  );
  const papers = filteredItems.filter(
    (item): item is Paper => item.itemType === "paper",
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const truncateAuthors = (authors: string, maxLength = 40) =>
    authors.length <= maxLength
      ? authors
      : authors.substring(0, maxLength) + "...";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[var(--bg-primary)] border-l border-[var(--border-primary)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[var(--border-primary)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                    <FileText
                      size={20}
                      className="text-[var(--accent-primary)]"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      Select a Paper
                    </h2>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Choose a paper to start chatting
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers and folders..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/10 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Breadcrumb */}
            {breadcrumbs.length > 0 && (
              <div className="px-6 py-3 border-b border-[var(--border-primary)]/50 bg-[var(--bg-secondary)]/50">
                <div className="flex items-center gap-1 text-sm overflow-x-auto">
                  <button
                    onClick={() =>
                      handleBreadcrumbClick({ id: null, name: "Root" })
                    }
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all shrink-0"
                  >
                    <Home size={13} />
                    <span className="text-xs">Papers</span>
                  </button>
                  {breadcrumbs.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center gap-1 shrink-0"
                    >
                      <ChevronRight
                        size={12}
                        className="text-[var(--text-tertiary)]"
                      />
                      <button
                        onClick={() => handleBreadcrumbClick(item)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          index === breadcrumbs.length - 1
                            ? "text-[var(--text-primary)] font-medium"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                        }`}
                      >
                        {item.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2
                      size={28}
                      className="animate-spin text-[var(--accent-primary)]"
                    />
                    <span className="text-sm text-[var(--text-tertiary)]">
                      Loading papers...
                    </span>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                    <FileText
                      size={28}
                      className="text-[var(--text-tertiary)]"
                    />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                    {searchQuery ? "No results found" : "No papers here"}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] text-center">
                    {searchQuery
                      ? "Try a different search term"
                      : "Save papers to your workspace to chat with them"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {/* Back button */}
                  {currentFolderId && (
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={handleGoBack}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                    >
                      <ArrowLeft size={15} />
                      <span>Back</span>
                    </motion.button>
                  )}

                  {/* Folders Section */}
                  {folders.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] px-3 py-2">
                        Folders
                      </p>
                      <div className="space-y-0.5">
                        {folders.map((folder, index) => (
                          <motion.button
                            key={folder._id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleNavigateToFolder(folder)}
                            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)] transition-all group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <FolderIcon
                                size={18}
                                className="text-[var(--accent-primary)]"
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                {folder.name}
                              </p>
                              <p className="text-xs text-[var(--text-tertiary)]">
                                {formatDate(folder.createdAt)}
                              </p>
                            </div>
                            <ChevronRight
                              size={16}
                              className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Papers Section */}
                  {papers.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] px-3 py-2">
                        Papers
                      </p>
                      <div className="space-y-0.5">
                        {papers.map((paper, index) => (
                          <motion.button
                            key={paper._id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: (folders.length + index) * 0.03,
                            }}
                            onClick={() => onSelect(paper)}
                            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--accent-primary)]/20 transition-all group text-left"
                          >
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <FileText size={18} className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate leading-snug">
                                {paper.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-[var(--text-tertiary)] truncate max-w-[180px] flex items-center gap-1">
                                  <User size={10} className="shrink-0" />
                                  {truncateAuthors(paper.authors)}
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 shrink-0">
                                  <Calendar size={10} />
                                  {formatDate(paper.published)}
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/50">
              <p className="text-xs text-[var(--text-tertiary)] text-center">
                {papers.length} paper{papers.length !== 1 ? "s" : ""} ·{" "}
                {folders.length} folder{folders.length !== 1 ? "s" : ""}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
