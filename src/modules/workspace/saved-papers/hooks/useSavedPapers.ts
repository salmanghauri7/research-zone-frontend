import { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import { useNotification } from "@/contexts/NotificationContext";
import { folderApi } from "@/api/foldersApi";
import { deletePaper } from "@/api/papersApi";
import {
  FolderItem,
  Folder,
  Paper,
  BreadcrumbItem,
  SortOption,
} from "../components/types";

interface UseSavedPapersResult {
  items: FolderItem[];
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
  error: string | null;
  sortBy: SortOption;
  currentFolderName: string;
  folderCount: number;
  paperCount: number;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isDeletePaperModalOpen: boolean;
  selectedFolder: Folder | null;
  selectedPaper: Paper | null;
  isSubmitting: boolean;
  sortedItems: FolderItem[];
  setIsCreateModalOpen: (open: boolean) => void;
  setIsEditModalOpen: (open: boolean) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  setIsDeletePaperModalOpen: (open: boolean) => void;
  setSortBy: (sort: SortOption) => void;
  setSelectedFolder: (folder: Folder | null) => void;
  setSelectedPaper: (paper: Paper | null) => void;
  handleCreateFolder: (name: string) => Promise<void>;
  handleEditFolder: (name: string) => Promise<void>;
  handleDeleteFolder: () => Promise<void>;
  handleDeletePaper: () => Promise<void>;
  handleNavigateToFolder: (folder: Folder) => void;
  handleBreadcrumbClick: (item: BreadcrumbItem) => void;
  openEditModal: (folder: Folder) => void;
  openDeleteModal: (folder: Folder) => void;
  openDeletePaperModal: (paper: Paper) => void;
  fetchFolderContents: () => Promise<void>;
}

export default function useSavedPapers(
  workspaceId: string,
): UseSavedPapersResult {
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletePaperModalOpen, setIsDeletePaperModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFolderContents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await folderApi.getFolderContents(
        workspaceId,
        currentFolderId,
      );
      setItems(data);
    } catch (err) {
      setError("Failed to load contents. Please try again.");
      console.error("Error fetching folder contents:", err);
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
    } catch (err) {
      console.error("Error fetching breadcrumbs:", err);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchFolderContents();
    fetchBreadcrumbs();
  }, [fetchFolderContents, fetchBreadcrumbs]);

  const sortedItems = [...items].sort((a, b) => {
    if (a.itemType === "folder" && b.itemType === "paper") return -1;
    if (a.itemType === "paper" && b.itemType === "folder") return 1;

    switch (sortBy) {
      case "name": {
        const nameA = a.itemType === "folder" ? a.name : a.title;
        const nameB = b.itemType === "folder" ? b.name : b.title;
        return nameA.localeCompare(nameB);
      }
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

  const handleCreateFolder = async (name: string) => {
    try {
      setIsSubmitting(true);
      const newFolder = await folderApi.createFolder(
        workspaceId,
        name,
        currentFolderId,
      );
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
      setItems((prev) =>
        prev.map((item) =>
          item._id === selectedFolder._id && item.itemType === "folder"
            ? { ...item, name: updatedFolder.name }
            : item,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedFolder(null);
      showSuccess("Folder renamed successfully");
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
      setItems((prev) =>
        prev.filter((item) => item._id !== selectedFolder._id),
      );
      setIsDeleteModalOpen(false);
      setSelectedFolder(null);
      showSuccess("Folder deleted successfully");
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
      setItems((prev) => prev.filter((item) => item._id !== selectedPaper._id));
      setIsDeletePaperModalOpen(false);
      setSelectedPaper(null);
      showSuccess("Paper deleted successfully");
    } catch (err) {
      console.error("Error deleting paper:", err);
      showError("Failed to delete paper. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFolderName =
    breadcrumbs[breadcrumbs.length - 1]?.name || "Saved Papers";
  const folderCount = items.filter((item) => item.itemType === "folder").length;
  const paperCount = items.filter((item) => item.itemType === "paper").length;

  return {
    items,
    currentFolderId,
    breadcrumbs,
    isLoading,
    error,
    sortBy,
    currentFolderName,
    folderCount,
    paperCount,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isDeletePaperModalOpen,
    selectedFolder,
    selectedPaper,
    isSubmitting,
    sortedItems,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    setIsDeletePaperModalOpen,
    setSelectedFolder,
    setSelectedPaper,
    setSortBy,
    handleCreateFolder,
    handleEditFolder,
    handleDeleteFolder,
    handleDeletePaper,
    handleNavigateToFolder,
    handleBreadcrumbClick,
    openEditModal,
    openDeleteModal,
    openDeletePaperModal,
    fetchFolderContents,
  };
}
