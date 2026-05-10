"use client";

import FolderBreadcrumb from "./FolderBreadcrumb";
import FolderHeader from "./FolderHeader";
import FolderControls from "./FolderControls";
import FolderList from "./FolderList";
import EmptyState from "./EmptyState";
import { ErrorState, LoadingState } from "./FolderStates";
import FolderModal from "./FolderModal";
import DeleteFolderModal from "./DeleteFolderModal";
import useSavedPapers from "@/modules/workspace/saved-papers/hooks/useSavedPapers";

interface SavedPapersContentProps {
  workspaceId: string;
}

export default function SavedPapersContent({
  workspaceId,
}: SavedPapersContentProps) {
  const {
    breadcrumbs,
    isLoading,
    error,
    viewMode,
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
    setViewMode,
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
  } = useSavedPapers(workspaceId);

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
