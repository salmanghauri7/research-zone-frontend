import api from "@/utils/axios";

// Types for API requests and responses
export interface FetchMessagesParams {
  workspaceId: string;
  limit?: number;
  cursor?: string | null;
}

export interface BackendMessage {
  _id: string;
  workspaceId: string;
  sender: {
    _id: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
  };
  parentMessageId?: string | null;
  replyCount?: number;
  quotedMessageId?: string | null;
  content: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: Record<string, string[]>;
  messageType: "text" | "file" | "image";
  voiceDuration?: number;
  attachments?: Array<{
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FetchMessagesResponse {
  messages: BackendMessage[];
  cursor: string | null;
  hasMore: boolean;
}

/**
 * Chat API Module
 * Centralized API calls for all chat-related endpoints
 */
class ChatApi {
  /**
   * Fetch messages for a workspace with pagination support
   */
  async fetchMessages({
    workspaceId,
    limit = 50,
    cursor = null,
  }: FetchMessagesParams): Promise<FetchMessagesResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await api.get<{
      success: boolean;
      message: string;
      statusCode: number;
      data: FetchMessagesResponse;
    }>(`/chat/workspace/${workspaceId}/messages?${params.toString()}`);

    return response.data.data;
  }
}

// Export singleton instance
export const chatApi = new ChatApi();
