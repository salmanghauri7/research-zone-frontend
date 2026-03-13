import api from "@/utils/axios";

export const notificationApi = {
  getNotifications: async (params: { page?: number; limit?: number; isRead?: boolean } = {}) => {
    const { data } = await api.get("/notifications", { params });
    return data;
  },
  
  markAsRead: async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.patch("/notifications/read-all");
    return data;
  },
  
  deleteNotification: async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  }
};
