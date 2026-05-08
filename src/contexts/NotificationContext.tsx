"use client";

import React, { createContext, useContext, useCallback } from "react";
import { toast } from "sonner";

interface NotificationContextType {
  showNotification: (
    message: string,
    type: "success" | "error" | "info",
  ) => void;
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
  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info") => {
      if (type === "success") {
        toast.success(message);
        return;
      }

      if (type === "error") {
        toast.error(message);
        return;
      }

      toast(message);
    },
    [],
  );

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

  return (
    <NotificationContext.Provider
      value={{ showNotification, showSuccess, showError, showInfo }}
    >
      {children}
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
