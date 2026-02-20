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
    fileName?: string;
    fileKey?: string;
    fileSize?: number;
    mimeType?: string;
    _id?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FetchMessagesResponse {
  messages: BackendMessage[];
  cursor: string | null;
  hasMore: boolean;
}

export interface UploadAttachmentResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileKey: string;
  bucket?: string;
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
    console.log(response, "response from message api");

    return response.data.data;
  }

  /**
   * Upload attachments to S3 and get URLs back
   */
  async uploadAttachments(
    workspaceId: string,
    files: File[],
  ): Promise<UploadAttachmentResponse[]> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post<{
      success: boolean;
      message: string;
      statusCode: number;
      data: {
        attachments: UploadAttachmentResponse[];
        totalFiles: number;
      };
      timestamp: string;
    }>(`/chat/workspace/${workspaceId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload response:", response.data);

    // Validate response structure
    if (!response.data?.data?.attachments) {
      console.error("Invalid upload response structure:", response.data);
      throw new Error("Invalid response from upload API");
    }

    return response.data.data.attachments;
  }
}

// Export singleton instance
export const chatApi = new ChatApi();
