"use client";

import { FolderItem, Folder, Paper } from "./types";
import FolderItemComponent from "./FolderItem";
import PaperItem from "./PaperItem";

interface FolderListProps {
  items: FolderItem[];
  highlightedPaperId?: string | null;
  onNavigate: (folder: Folder) => void;
  onEdit: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  onDeletePaper: (paper: Paper) => void;
}

export default function FolderList({
  items,
   highlightedPaperId,
  onNavigate,
  onEdit,
  onDelete,
  onDeletePaper,
}: FolderListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        if (item.itemType === "folder") {
          return (
            <FolderItemComponent
              key={item._id}
              folder={item}
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
              isHighlighted={highlightedPaperId === item._id}
              onDelete={() => onDeletePaper(item)}
            />
          );
        }
      })}
    </div>
  );
}
