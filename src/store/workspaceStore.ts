import { create } from "zustand";

interface WorkspaceState {
  currentWorkspaceId: string | null;
  isOwner: boolean | null;
  workspaceTitle: string | null;
  setWorkspace: (workspaceId: string, isOwner: boolean, title: string) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspaceId: null,
  isOwner: null,
  workspaceTitle: null,
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
