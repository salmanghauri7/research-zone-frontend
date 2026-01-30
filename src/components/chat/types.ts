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
  attachments?: Attachment[];
  replyTo?: Message;
  threadCount?: number;
}

export interface Thread {
  parentMessage: Message;
  replies: Message[];
}
