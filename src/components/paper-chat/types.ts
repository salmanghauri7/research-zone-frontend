import {
  Paper,
  Folder,
  FolderItem,
  BreadcrumbItem,
} from "@/components/saved-papers/types";

// Re-export useful types from saved-papers
export type { Paper, Folder, FolderItem, BreadcrumbItem };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface PaperChatState {
  selectedPaper: Paper | null;
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
}

export type PaperChatView = "picker" | "chat";
