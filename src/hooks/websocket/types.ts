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

// Chat/Message events
export interface AttachmentPayload {
  url: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
}

export interface SendMessagePayload {
  workspaceId: string;
  content: string;
  messageType: "text" | "file" | "image";
  attachments?: AttachmentPayload[];
  parentMessageId?: string; // For thread replies
  quotedMessageId?: string; // For quote replies
}

export interface MessageData {
  id: string;
  workspaceId: string;
  sender: {
    _id: string;
    firstName: string;
    username?: string;
  };
  content: string;
  messageType: "text" | "file" | "image";
  attachments?: AttachmentPayload[];
  parentMessageId?: string;
  quotedMessageId?: string;
  replyCount?: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Generic event handler types
export type EventHandler<T = unknown> = (data: T) => void;
export type ErrorHandler = (error: JoinWorkspaceErrorData) => void;
