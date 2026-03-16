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
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[var(--bg-primary)] border-l border-[var(--border-primary)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] z-10 shrink-0">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-emerald-500/20 flex items-center justify-center ring-1 ring-[var(--accent-primary)]/20">
                    <FileText
                      size={22}
                      className="text-[var(--accent-primary)]"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                      Select a Paper
                    </h2>
                    <p className="text-[13px] text-[var(--text-secondary)] font-medium mt-0.5">
                      Choose a paper to start chatting
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  aria-label="Close panel"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="relative group">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers and folders..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
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
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 h-full">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2
                      size={32}
                      className="animate-spin text-[var(--accent-primary)]"
                    />
                    <span className="text-[14px] font-medium text-[var(--text-tertiary)]">
                      Loading your library...
                    </span>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 h-full">
                  <div className="w-20 h-20 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mb-5 shadow-sm">
                    <FileText
                      size={32}
                      strokeWidth={1.5}
                      className="text-[var(--text-tertiary)]"
                    />
                  </div>
                  <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5">
                    {searchQuery ? "No results found" : "No papers here"}
                  </p>
                  <p className="text-[13px] text-[var(--text-tertiary)] text-center max-w-[240px] leading-relaxed">
                    {searchQuery
                      ? "Try adjusting your search terms to find what you're looking for."
                      : "Save papers to your workspace to start exploring them with AI."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Back button */}
                  {currentFolderId && (
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={handleGoBack}
                      className="flex items-center gap-2.5 w-full px-4 py-3 rounded-2xl text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-subtle)] transition-all group"
                    >
                      <div className="p-1 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] shadow-sm group-hover:scale-105 transition-transform">
                        <ArrowLeft size={16} strokeWidth={2.5} />
                      </div>
                      <span>Back to previous folder</span>
                    </motion.button>
                  )}

                  {/* Folders Section */}
                  {folders.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] px-2 mb-3">
                        Folders
                      </p>
                      <div className="space-y-1.5">
                        {folders.map((folder, index) => (
                          <motion.button
                            key={folder._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: index * 0.03,
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                            onClick={() => handleNavigateToFolder(folder)}
                            className="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl hover:bg-[var(--bg-secondary)] hover:shadow-sm border border-transparent hover:border-[var(--border-primary)] transition-all group focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40"
                          >
                            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <FolderIcon
                                size={20}
                                className="text-[var(--accent-primary)] fill-[var(--accent-primary)]/20"
                              />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors">
                                {folder.name}
                              </p>
                              <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5 font-medium">
                                {formatDate(folder.createdAt)}
                              </p>
                            </div>
                            <ChevronRight
                              size={16}
                              className="text-[var(--text-tertiary)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Papers Section */}
                  {papers.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)] px-2 mb-3">
                        Papers
                      </p>
                      <div className="space-y-2">
                        {papers.map((paper, index) => (
                          <motion.button
                            key={paper._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: (folders.length + index) * 0.03,
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                            onClick={() => onSelect(paper)}
                            className="flex items-start gap-4 w-full px-4 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/40 hover:shadow-md transition-all group text-left focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/0 to-[var(--accent-primary)]/0 group-hover:from-[var(--accent-primary)]/5 group-hover:to-transparent transition-colors duration-500" />
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-sm transition-all duration-300 mt-0.5 z-10 relative bg-white dark:bg-black/50">
                              <FileText size={18} className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0 relative z-10">
                              <h3 className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 mb-2">
                                {paper.title}
                              </h3>
                              <div className="flex items-center gap-2.5">
                                <span className="text-[12px] font-medium text-[var(--text-tertiary)] truncate flex items-center gap-1.5">
                                  <User size={12} className="shrink-0" />
                                  {truncateAuthors(paper.authors, 30)}
                                </span>
                                <span className="hidden sm:flex text-[12px] font-medium text-[var(--text-tertiary)] items-center gap-1.5 shrink-0 border-l border-[var(--border-primary)] pl-2.5">
                                  <Calendar size={12} className="shrink-0" />
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
