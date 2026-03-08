import axios from "@/utils/axios";
import {
  FolderItem,
  BreadcrumbItem,
  Folder,
} from "@/components/saved-papers/types";

export const folderApi = {
  getFolderContents: async (
    workspaceId: string,
    folderId?: string | null,
  ): Promise<FolderItem[]> => {
    const url = `/folders/workspace/${workspaceId}`;
    const params = folderId ? { folderId } : {};

    const response = await axios.get(url, { params });
    return response.data.data;
  },

  createFolder: async (
    workspaceId: string,
    name: string,
    parentFolderId: string | null,
  ): Promise<Folder> => {
    const response = await axios.post(`/folders`, {
      name,
      workspaceId,
      parentFolderId: parentFolderId || undefined, // Don't send null, send undefined or omit
    });
    return { ...response.data.data, itemType: "folder" as const };
  },

  updateFolder: async (folderId: string, name: string): Promise<Folder> => {
    const response = await axios.patch(`/folders/${folderId}`, { name });
    return { ...response.data.data, itemType: "folder" as const };
  },

  deleteFolder: async (folderId: string): Promise<void> => {
    await axios.delete(`/folders/${folderId}/recursive`);
  },

  getFolderPath: async (folderId: string): Promise<BreadcrumbItem[]> => {
    const response = await axios.get(`/folders/${folderId}/path`);
    return response.data.data;
  },
};
