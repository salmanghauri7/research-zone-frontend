import axios from "@/utils/axios";

export const searchPapers = async (query: string, page: number = 1) => {
  try {
    const response = await axios.get(`/papers/search`, {
      params: { q: query, page },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error searching papers:", error);
    throw error;
  }
};

// Folder tree type for the API response
export interface FolderTreeNode {
  _id: string;
  workspaceId: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
  updatedAt: string;
  children: FolderTreeNode[];
}

// Get folder tree for a workspace
export const getFolderTree = async (
  workspaceId: string,
): Promise<FolderTreeNode[]> => {
  try {
    const response = await axios.get(`/folders/workspace/${workspaceId}/tree`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching folder tree:", error);
    throw error;
  }
};

// Save paper to a folder
export interface SavePaperData {
  workspaceId: string;
  folderId: string | null;
  title: string;
  link: string;
  authors: string;
  published: string;
}

export const savePaper = async (data: SavePaperData) => {
  try {
    const response = await axios.post(`/saved-papers`, data);
    return response.data;
  } catch (error) {
    console.error("Error saving paper:", error);
    throw error;
  }
};

// Delete a saved paper
export const deletePaper = async (paperId: string) => {
  try {
    await axios.delete(`/saved-papers/${paperId}`);
  } catch (error) {
    console.error("Error deleting paper:", error);
    throw error;
  }
};
