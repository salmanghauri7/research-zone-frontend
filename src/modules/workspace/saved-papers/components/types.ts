// Types for Saved Papers / Folders
export interface Folder {
  _id: string;
  workspaceId: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
  updatedAt: string;
  itemType: "folder";
}

export interface Paper {
  _id: string;
  workspaceId: string;
  userId: string;
  folderId: string | null;
  title: string;
  authors: string;
  published: string;
  link: string;
  createdAt: string;
  updatedAt: string;
  savedBy: string;
  itemType: "paper";
}

export type FolderItem = Folder | Paper;

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export type SortOption = "name" | "dateAdded" | "dateModified";
export type ViewMode = "list" | "grid";
