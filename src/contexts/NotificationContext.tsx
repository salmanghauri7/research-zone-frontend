"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { ToastType } from "@/components/Toast";

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

  const generateAvatar = (text: string): string => {
    return text
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const generateAvatarColor = (): string => {
    const colors = [
      "#7C3AED", "#0891B2", "#059669", "#DC2626", 
      "#D97706", "#BE185D", "#6366F1", "#EC4899"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRelativeTime = (date: Date): string => {
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
  };

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

  const markAsRead = useCallback((id: string) => {
    setPanelNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setPanelNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setPanelNotifications((prev) => prev.filter((notif) => notif.id !== id));
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
