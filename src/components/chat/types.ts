export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Attachment {
  id: string;
  type: "image" | "file" | "voice";
  url: string;
  name: string;
  size?: number;
  duration?: number; // for voice messages
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  isEdited?: boolean;
  isDeleted?: boolean;
  attachments?: Attachment[];
  replyTo?: Message;
  threadCount?: number;
  // Client-side stable ID that persists across optimistic -> real message transition
  // Used as React key to prevent remounting when backend ID replaces optimistic ID
  clientMessageId?: string;
  // Upload-related fields for optimistic UI
  isUploading?: boolean;
  uploadProgress?: Record<string, number>; // attachmentId -> progress (0-100)
  uploadError?: Record<string, string>; // attachmentId -> error message
  blobUrls?: Record<string, string>; // attachmentId -> blob URL for cleanup
}

export interface Thread {
  parentMessage: Message;
  replies: Message[];
}
