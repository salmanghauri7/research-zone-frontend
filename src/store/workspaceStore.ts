import { create } from "zustand";

interface WorkspaceState {
  currentWorkspaceId: string | null;
  isOwner: boolean | null;
  isSearching: boolean;
  workspaceTitle: string | null;
  setWorkspace: (workspaceId: string, isOwner: boolean, title: string) => void;
  clearWorkspace: () => void;
  setIsSearching: (isSearching: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspaceId: null,
  isOwner: null,
  isSearching: false,
  workspaceTitle: null,
  setIsSearching: (isSearching) => set({ isSearching }),
  setWorkspace: (workspaceId, isOwner, title) =>
    set({
      currentWorkspaceId: workspaceId,
      isOwner,
      workspaceTitle: title,
    }),
  clearWorkspace: () =>
    set({
      currentWorkspaceId: null,
      isOwner: null,
      workspaceTitle: null,
    }),
}));
