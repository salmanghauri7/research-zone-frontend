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
  isUploading?: boolean; // true while file is being uploaded to S3
  localBlobUrl?: string; // local blob URL for immediate preview while uploading
  uploadProgress?: number; // 0-100 upload progress percentage
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
  parentMessageId?: string | null; // ID of parent message if this is a thread reply
}

export interface Thread {
  parentMessage: Message;
  replies: Message[];
}
