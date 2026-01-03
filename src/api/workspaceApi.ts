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
        return api.post("/api/workspaces/create", data);
    }

    /**
     * Get all workspaces owned by the current user
     */
    async getOwnerWorkspaces() {
        return api.get("/api/workspaces/owner");
    }
}

// Export singleton instance
const workspaceApi = new WorkspaceApi();
export default workspaceApi;
