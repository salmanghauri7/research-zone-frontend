"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { memo } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { WorkspaceProvider } from "@/contexts/SidebarContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

// Memoize provider to prevent unnecessary re-renders
const Provider = memo(function Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider>
          <NotificationProvider>
            <ModalProvider>
              <WorkspaceProvider>{children}</WorkspaceProvider>
            </ModalProvider>
          </NotificationProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </SocketProvider>
  );
});

export default Provider;
