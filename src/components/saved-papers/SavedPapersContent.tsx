"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import {
  FolderItem,
  Folder,
  Paper,
  BreadcrumbItem,
  SortOption,
  ViewMode,
} from "./types";
import { folderApi } from "@/api/foldersApi";
import { deletePaper } from "@/api/papersApi";
import { AxiosError } from "axios";
import FolderBreadcrumb from "./FolderBreadcrumb";
import FolderHeader from "./FolderHeader";
import FolderControls from "./FolderControls";
import FolderList from "./FolderList";
import EmptyState from "./EmptyState";
import { ErrorState, LoadingState } from "./FolderStates";
import FolderModal from "./FolderModal";
import DeleteFolderModal from "./DeleteFolderModal";

interface SavedPapersContentProps {
  workspaceId: string;
}

export default function SavedPapersContent({
  workspaceId,
}: SavedPapersContentProps) {
  const { showSuccess, showError } = useNotification();

  // State
  const [items, setItems] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded");

  // Cache for folder contents - key is folderId (or 'root' for null)
  const cacheRef = useRef<Map<string, FolderItem[]>>(new Map());

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletePaperModalOpen, setIsDeletePaperModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch folder contents with caching
  const fetchFolderContents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cacheKey = currentFolderId || "root";

      // Check cache first
      if (cacheRef.current.has(cacheKey)) {
        setItems(cacheRef.current.get(cacheKey)!);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const data = await folderApi.getFolderContents(
        workspaceId,
        currentFolderId,
      );

      // Update cache and state
      cacheRef.current.set(cacheKey, data);
      setItems(data);
    } catch (err) {
      setError("Failed to load contents. Please try again.");
      console.error("Error fetching folder contents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, currentFolderId]);

  // Invalidate cache for a specific folder
  const invalidateCache = useCallback((folderId: string | null) => {
    const cacheKey = folderId || "root";
    cacheRef.current.delete(cacheKey);
  }, []);

  // Fetch breadcrumb path
  const fetchBreadcrumbs = useCallback(async () => {
    if (!currentFolderId) {
      setBreadcrumbs([]);
      return;
    }

    try {
      const path = await folderApi.getFolderPath(currentFolderId);
      setBreadcrumbs(path);
    } catch (err) {
      console.error("Error fetching breadcrumbs:", err);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchFolderContents();
    fetchBreadcrumbs();
  }, [fetchFolderContents, fetchBreadcrumbs]);

  // Sort items (folders first, then papers)
  const sortedItems = [...items].sort((a, b) => {
    // Folders always come before papers
    if (a.itemType === "folder" && b.itemType === "paper") return -1;
    if (a.itemType === "paper" && b.itemType === "folder") return 1;

    // Sort within the same type
    switch (sortBy) {
      case "name":
        const nameA = a.itemType === "folder" ? a.name : a.title;
        const nameB = b.itemType === "folder" ? b.name : b.title;
        return nameA.localeCompare(nameB);
      case "dateModified":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "dateAdded":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  // Handlers
  const handleCreateFolder = async (name: string) => {
    try {
      setIsSubmitting(true);
      const newFolder = await folderApi.createFolder(
        workspaceId,
        name,
        currentFolderId,
      );

      // Invalidate cache and add to current view
      invalidateCache(currentFolderId);
      setItems((prev) => [newFolder, ...prev]);
      setIsCreateModalOpen(false);
      showSuccess(`Folder "${name}" created successfully`);
    } catch (err) {
      console.error("Error creating folder:", err);
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to create folder. Please try again.";
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFolder = async (name: string) => {
    if (!selectedFolder) return;

    try {
      setIsSubmitting(true);
      const updatedFolder = await folderApi.updateFolder(
        selectedFolder._id,
        name,
      );

      // Invalidate cache and update current view
      invalidateCache(currentFolderId);
      setItems((prev) =>
        prev.map((item) =>
          item._id === selectedFolder._id && item.itemType === "folder"
            ? { ...item, name: updatedFolder.name }
            : item,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedFolder(null);
      showSuccess(`Folder renamed successfully`);
    } catch (err) {
      console.error("Error updating folder:", err);
      showError("Failed to update folder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;

    try {
      setIsSubmitting(true);
      await folderApi.deleteFolder(selectedFolder._id);

      // Invalidate cache and remove from current view
      invalidateCache(currentFolderId);
      setItems((prev) =>
        prev.filter((item) => item._id !== selectedFolder._id),
      );
      setIsDeleteModalOpen(false);
      setSelectedFolder(null);
      showSuccess(`Folder deleted successfully`);
    } catch (err) {
      console.error("Error deleting folder:", err);
      showError("Failed to delete folder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToFolder = (folder: Folder) => {
    setCurrentFolderId(folder._id);
  };

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    setCurrentFolderId(item.id);
  };

  const openEditModal = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsDeleteModalOpen(true);
  };

  const openDeletePaperModal = (paper: Paper) => {
    setSelectedPaper(paper);
    setIsDeletePaperModalOpen(true);
  };

  const handleDeletePaper = async () => {
    if (!selectedPaper) return;

    try {
      setIsSubmitting(true);
      await deletePaper(selectedPaper._id);

      // Invalidate cache and remove from current view
      invalidateCache(currentFolderId);
      setItems((prev) => prev.filter((item) => item._id !== selectedPaper._id));
      setIsDeletePaperModalOpen(false);
      setSelectedPaper(null);
      showSuccess(`Paper deleted successfully`);
    } catch (err) {
      console.error("Error deleting paper:", err);
      showError("Failed to delete paper. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current folder name for header
  const currentFolderName =
    breadcrumbs[breadcrumbs.length - 1]?.name || "Saved Papers";

  // Get counts for header
  const folderCount = items.filter((item) => item.itemType === "folder").length;
  const paperCount = items.filter((item) => item.itemType === "paper").length;

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={fetchFolderContents} />;
    }

    if (sortedItems.length === 0) {
      return <EmptyState onCreateFolder={() => setIsCreateModalOpen(true)} />;
    }

    return (
      <FolderList
        items={sortedItems}
        viewMode={viewMode}
        onNavigate={handleNavigateToFolder}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onDeletePaper={openDeletePaperModal}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <FolderBreadcrumb
        items={breadcrumbs}
        onNavigate={handleBreadcrumbClick}
      />

      {/* Header */}
      <FolderHeader
        title={currentFolderName}
        folderCount={folderCount}
        paperCount={paperCount}
        onCreateFolder={() => setIsCreateModalOpen(true)}
      />

      {/* Controls Bar */}
      <FolderControls
        sortBy={sortBy}
        viewMode={viewMode}
        onSortChange={setSortBy}
        onViewModeChange={setViewMode}
      />

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      <FolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFolder}
        isSubmitting={isSubmitting}
        mode="create"
      />

      <FolderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedFolder(null);
        }}
        onSubmit={handleEditFolder}
        isSubmitting={isSubmitting}
        mode="edit"
        initialName={selectedFolder?.name || ""}
      />

      <DeleteFolderModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedFolder(null);
        }}
        onConfirm={handleDeleteFolder}
        isDeleting={isSubmitting}
        folderName={selectedFolder?.name || ""}
      />

      <DeleteFolderModal
        isOpen={isDeletePaperModalOpen}
        onClose={() => {
          setIsDeletePaperModalOpen(false);
          setSelectedPaper(null);
        }}
        onConfirm={handleDeletePaper}
        isDeleting={isSubmitting}
        folderName={selectedPaper?.title || ""}
      />
    </div>
  );
}
