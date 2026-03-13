import api from "@/utils/axios";

// Types
export interface PaperChatMessage {
  _id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface PaperChatSession {
  _id: string;
  workspaceId: string;
  paperId: string;
  paperTitle: string;
  messages: PaperChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResponse {
  message: PaperChatMessage;
  sessionId: string;
}

export const paperChatApi = {
  // Generate embeddings for a paper
  generateEmbeddings: async (paperId: string, pdfUrl: string) => {
    const response = await api.post(`/paper-chat/embeddings`, {
      paperId,
      pdfUrl,
    });
    return response.data;
  },

  // Get or create a chat session for a paper
  getSession: async (
    workspaceId: string,
    paperId: string,
  ): Promise<PaperChatSession> => {
    const response = await api.get(
      `/paper-chat/session/${workspaceId}/${paperId}`,
    );
    return response.data.data;
  },

  // Send a message and get AI response
  sendMessage: async (
    workspaceId: string,
    paperId: string,
    content: string,
    sessionId?: string,
  ): Promise<SendMessageResponse> => {
    const response = await api.post(`/paper-chat/message`, {
      workspaceId,
      paperId,
      content,
      sessionId,
    });
    return response.data.data;
  },

  // Get chat history for a session
  getHistory: async (sessionId: string): Promise<PaperChatMessage[]> => {
    const response = await api.get(`/paper-chat/history/${sessionId}`);
    return response.data.data;
  },

  // Delete a chat session
  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/paper-chat/session/${sessionId}`);
  },

  // Get all chat sessions for a workspace
  getSessions: async (workspaceId: string): Promise<PaperChatSession[]> => {
    const response = await api.get(`/paper-chat/sessions/${workspaceId}`);
    return response.data.data;
  },
};
