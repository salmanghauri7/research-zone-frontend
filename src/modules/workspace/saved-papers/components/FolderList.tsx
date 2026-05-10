"use client";

import { FolderItem, ViewMode, Folder, Paper } from "./types";
import FolderItemComponent from "./FolderItem";
import PaperItem from "./PaperItem";

interface FolderListProps {
  items: FolderItem[];
  viewMode: ViewMode;
  onNavigate: (folder: Folder) => void;
  onEdit: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  onDeletePaper: (paper: Paper) => void;
}

export default function FolderList({
  items,
  viewMode,
  onNavigate,
  onEdit,
  onDelete,
  onDeletePaper,
}: FolderListProps) {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-2"
      }
    >
      {items.map((item) => {
        if (item.itemType === "folder") {
          return (
            <FolderItemComponent
              key={item._id}
              folder={item}
              viewMode={viewMode}
              onNavigate={() => onNavigate(item)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          );
        } else {
          return (
            <PaperItem
              key={item._id}
              paper={item}
              viewMode={viewMode}
              onDelete={() => onDeletePaper(item)}
            />
          );
        }
      })}
    </div>
  );
}
