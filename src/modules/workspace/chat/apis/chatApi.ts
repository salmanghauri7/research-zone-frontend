import api from "@/utils/http/axios";

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
  clientId?: string;
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

export interface SearchMessagesParams {
  workspaceId: string;
  query: string;
  limit?: number;
  cursor?: string | null;
}

export interface SearchMessagesResponse {
  results: BackendMessage[];
  cursor: string | null;
  hasMore: boolean;
}

class ChatApi {
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

    const data = response.data.data;
    return {
      messages: data?.messages || [],
      cursor: data?.cursor || null,
      hasMore: data?.hasMore || false,
    };
  }

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

    if (!response.data?.data?.attachments) {
      throw new Error("Invalid response from upload API");
    }

    return response.data.data.attachments;
  }

  async searchMessages({
    workspaceId,
    query,
    limit = 10,
    cursor = null,
  }: SearchMessagesParams): Promise<SearchMessagesResponse> {
    const response = await api.post<{
      success: boolean;
      message: string;
      statusCode: number;
      data: SearchMessagesResponse;
      timestamp: string;
    }>(`/chat/workspace/${workspaceId}/search`, {
      query,
      limit,
      ...(cursor && { cursor }),
    });

    const data = response.data.data;
    return {
      results: data?.results || [],
      cursor: data?.cursor || null,
      hasMore: data?.hasMore || false,
    };
  }
}

export const chatApi = new ChatApi();
