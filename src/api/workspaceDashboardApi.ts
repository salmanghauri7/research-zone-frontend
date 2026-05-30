import api from "@/utils/http/axios";

export interface DashboardMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  papersCount: number;
}

export interface DashboardPaper {
  _id: string;
  title: string;
  author: string;
  savedAt: string;
  tag: string;
}

export interface ActivityPoint {
  day: string;
  value: number;
}

export interface WorkspaceDashboardData {
  workspace: {
    _id: string;
    title: string;
    description?: string | null;
    color?: string;
    createdAt: string;
  };
  stats: {
    totalMembers: number;
    totalPapers: number;
    activityChange: number;
  };
  topContributors: DashboardMember[];
  recentPapers: DashboardPaper[];
  activityData: ActivityPoint[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

const workspaceDashboardApi = {
  async getDashboard(workspaceId: string): Promise<WorkspaceDashboardData> {
    const response = await api.get<ApiResponse<WorkspaceDashboardData>>(
      `/workspaces/${workspaceId}/dashboard`,
    );

    return response.data.data;
  },
};

export default workspaceDashboardApi;
