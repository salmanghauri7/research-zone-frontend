import api from "@/utils/http/axios";

export interface RadarRunResponse {
  categories: string[];
  total: number;
}

export interface RadarCategoriesResponse {
  categories: string[];
}

export interface RadarNotificationsResponse {
  items: Array<Record<string, unknown>>;
  nextCursor: string | null;
}

export interface RadarSaveNotificationResponse {
  item: Record<string, unknown>;
}

export const startRadarRun = async (
  workspaceId: string,
  categories?: string[],
): Promise<RadarRunResponse> => {
  try {
    const response = await api.post("/radar", {
      workspaceId,
      ...(categories && categories.length > 0 ? { categories } : {}),
    });
    return response.data.data as RadarRunResponse;
  } catch (error) {
    console.error("Error starting radar run:", error);
    throw error;
  }
};

export const getRadarCategories = async (
  workspaceId: string,
): Promise<RadarCategoriesResponse> => {
  try {
    const response = await api.get("/radar/categories", {
      params: { workspaceId },
    });
    return response.data.data as RadarCategoriesResponse;
  } catch (error) {
    console.error("Error fetching radar categories:", error);
    throw error;
  }
};

export const getRadarNotifications = async (
  workspaceId: string,
  cursor?: string,
  limit?: number,
): Promise<RadarNotificationsResponse> => {
  try {
    const response = await api.get("/radar/notifications", {
      params: {
        workspaceId,
        ...(cursor ? { cursor } : {}),
        ...(limit ? { limit } : {}),
      },
    });
    return response.data.data as RadarNotificationsResponse;
  } catch (error) {
    console.error("Error fetching radar notifications:", error);
    throw error;
  }
};

export const saveRadarNotification = async (
  payload: Record<string, unknown>,
): Promise<RadarSaveNotificationResponse> => {
  try {
    const response = await api.post("/radar/notifications", payload);
    return response.data.data as RadarSaveNotificationResponse;
  } catch (error) {
    console.error("Error saving radar notification:", error);
    throw error;
  }
};
