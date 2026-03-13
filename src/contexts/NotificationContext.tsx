"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import Toast, { ToastType } from "@/components/Toast";
import { useSocket } from "./SocketContext";
import { notificationApi } from "@/api/notificationsApi";

interface Notification {
  id: string;
  message: string;
  type: ToastType;
}

export interface PanelNotification {
  id: string;
  user: string;
  avatar: string;
  avatarColor: string;
  workspace: string;
  workspaceId?: string;
  messageId?: string;
  message: string;
  time: string;
  read: boolean;
  type: "message" | "share" | "comment" | "invite" | "success" | "error" | "info";
  createdAt: Date;
}

interface NotificationContextType {
  showNotification: (message: string, type: ToastType, options?: { workspaceId?: string; workspace?: string; user?: string; messageId?: string }) => void;
  showSuccess: (message: string, options?: { workspaceId?: string; workspace?: string; user?: string; messageId?: string }) => void;
  showError: (message: string, options?: { workspaceId?: string; workspace?: string; user?: string; messageId?: string }) => void;
  showInfo: (message: string, options?: { workspaceId?: string; workspace?: string; user?: string; messageId?: string }) => void;
  panelNotifications: PanelNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [panelNotifications, setPanelNotifications] = useState<PanelNotification[]>([]);
  const { socket } = useSocket();

  const generateAvatar = useCallback((text: string): string => {
    if (!text) return "U";
    return text
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const generateAvatarColor = useCallback((): string => {
    const colors = [
      "#7C3AED", "#0891B2", "#059669", "#DC2626",
      "#D97706", "#BE185D", "#6366F1", "#EC4899"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const getRelativeTime = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationApi.getNotifications({ page: 1, limit: 50, isRead: false });
        if (response?.data?.notifications) {
          const mapped = response.data.notifications.map((n: any) => ({
            id: n._id,
            user: n.senderId?.username || n.senderId?.name || "User",
            avatar: generateAvatar(n.senderId?.username || n.senderId?.name || "U"),
            avatarColor: generateAvatarColor(),
            workspace: n.workspaceId?.name || "Workspace",
            workspaceId: n.workspaceId?._id || n.workspaceId,
            messageId: n.messageId?._id || n.messageId,
            message: n.content || "New message",
            time: getRelativeTime(new Date(n.createdAt)),
            read: n.isRead,
            type: "message",
            createdAt: new Date(n.createdAt),
          }));
          setPanelNotifications(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch initial notifications:", error);
      }
    };

    fetchNotifications();
  }, [generateAvatar, generateAvatarColor, getRelativeTime]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      const newNotif: PanelNotification = {
        id: data._id || `noti-${Date.now()}`,
        user: data.senderId?.username || data.senderId?.name || data.senderName || "User",
        avatar: generateAvatar(data.senderId?.username || data.senderName || "U"),
        avatarColor: generateAvatarColor(),
        workspace: data.workspaceId?.name || data.workspaceName || "Workspace",
        workspaceId: data.workspaceId?._id || data.workspaceId,
        messageId: data.messageId?._id || data.messageId,
        message: data.content || data.message || "New notification",
        time: "Just now",
        read: false,
        type: "message",
        createdAt: new Date(),
      };

      setPanelNotifications((prev) => [newNotif, ...prev]);
    };

    socket.on("message-notified", handleNewNotification);

    return () => {
      socket.off("message-notified", handleNewNotification);
    };
  }, [socket, generateAvatar, generateAvatarColor]);

  const showNotification = useCallback((
    message: string,
    type: ToastType,
    options?: { workspaceId?: string; workspace?: string; user?: string; messageId?: string }
  ) => {
    const id = Math.random().toString(36).substring(7);

    // Add toast notification
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Add panel notification
    const now = new Date();
    const panelNotif: PanelNotification = {
      id: `panel-${id}`,
      user: options?.user || "System",
      avatar: generateAvatar(options?.user || "System"),
      avatarColor: generateAvatarColor(),
      workspace: options?.workspace || "General",
      workspaceId: options?.workspaceId,
      messageId: options?.messageId,
      message,
      time: getRelativeTime(now),
      read: false,
      type: type === "success" || type === "error" || type === "info" ? type : "message",
      createdAt: now,
    };

    setPanelNotifications((prev) => [panelNotif, ...prev]);
  }, []);

  const showSuccess = useCallback(
    (message: string, options?: { workspaceId?: string; workspace?: string; user?: string; messageId?: string }) =>
      showNotification(message, "success", options),
    [showNotification],
  );

  const showError = useCallback(
    (message: string, options?: { workspaceId?: string; workspace?: string; user?: string; messageId?: string }) =>
      showNotification(message, "error", options),
    [showNotification],
  );

  const showInfo = useCallback(
    (message: string, options?: { workspaceId?: string; workspace?: string; user?: string; messageId?: string }) =>
      showNotification(message, "info", options),
    [showNotification],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setPanelNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    try {
      if (!id.startsWith("panel-")) {
        await notificationApi.markAsRead(id);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = panelNotifications.filter((n) => !n.read && !n.id.startsWith("panel-")).map((n) => n.id);

    // Optimistic update
    setPanelNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));

    try {
      // Execute the request for each unread message
      await Promise.all(unreadIds.map(id => notificationApi.markAsRead(id)));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, [panelNotifications]);

  const dismissNotification = useCallback(async (id: string) => {
    // Optimistic update
    setPanelNotifications((prev) => prev.filter((notif) => notif.id !== id));

    try {
      if (!id.startsWith("panel-")) {
        await notificationApi.deleteNotification(id);
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  const unreadCount = panelNotifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showInfo,
        panelNotifications,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        unreadCount,
      }}
    >
      {children}
      <div className="fixed top-6 right-6 z-60 flex flex-col gap-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
