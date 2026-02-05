// Workspace events
export interface JoinedWorkspaceData {
  workspaceId: string;
  workspace: {
    _id: string;
    title: string;
    color: string;
    memberCount: number;
  };
}

export interface UserJoinedWorkspaceData {
  userId: string;
  email: string;
  workspaceId: string;
}

export interface JoinWorkspaceErrorData {
  message: string;
  error?: string;
}

// Generic event handler types
export type EventHandler<T = any> = (data: T) => void;
export type ErrorHandler = (error: JoinWorkspaceErrorData) => void;
