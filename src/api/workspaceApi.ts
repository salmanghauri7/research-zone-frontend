import api from "@/utils/axios";

// Types for API requests
export interface CreateWorkspaceData {
  title: string;
}

/**
 * Workspace API Module
 * Centralized API calls for all workspace-related endpoints
 */
class WorkspaceApi {
  /**
   * Create a new workspace
   */
  async createWorkspace(data: CreateWorkspaceData) {
    return api.post("/workspaces/create", data);
  }

  /**
   * Get all workspaces owned by the current user
   */
  async getOwnerWorkspaces() {
    return api.get("/workspaces/owner");
  }
  async sendInvite(email: string, description: string, workspaceId: string) {
    return api.post(`/workspaces/${workspaceId}/invite`, {
      email,
      description,
    });
  }
  async acceptInvite(token: string) {
    return api.post(`/workspaces/accept-invitation`, { token });
  }
  async verifyInvite(token: string) {
    return api.post(`/workspaces/verify-invitation`, { token });
  }
  async getWorkspaces() {
    return api.get("/workspaces/all");
  }
  async leaveWorkspace(workspaceId: string) {
    return api.delete(`/workspaces/leave/${workspaceId}`);
  }

  async checkWorkspaceRole(workspaceId: string) {
    return api.get(`/workspaces/check-role/${workspaceId}`);
  }
}

// Export singleton instance
const workspaceApi = new WorkspaceApi();
export default workspaceApi;
