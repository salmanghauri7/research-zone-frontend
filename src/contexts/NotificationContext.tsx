"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { ToastType } from "@/components/Toast";

interface Notification {
  id: string;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  showNotification: (message: string, type: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
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

  const showNotification = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, message, type }]);
  }, []);

  const showSuccess = useCallback(
    (message: string) => showNotification(message, "success"),
    [showNotification],
  );

  const showError = useCallback(
    (message: string) => showNotification(message, "error"),
    [showNotification],
  );

  const showInfo = useCallback(
    (message: string) => showNotification(message, "info"),
    [showNotification],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification, showSuccess, showError, showInfo }}
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
    throw new Error(
      "useNotification must be used within NotificationProvider",
    );
  }
  return context;
};
