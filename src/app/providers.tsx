"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { lazy, Suspense, memo } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { WorkspaceProvider } from "@/contexts/SidebarContext";

// Lazy load socket provider as it's only needed for authenticated users
const SocketProvider = lazy(() =>
  import("@/contexts/SocketContext").then((mod) => ({
    default: mod.SocketProvider,
  })),
);

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

// Memoize provider to prevent unnecessary re-renders
const Provider = memo(function Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SocketProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeProvider>
            <ModalProvider>
              <WorkspaceProvider>{children}</WorkspaceProvider>
            </ModalProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </SocketProvider>
    </Suspense>
  );
});

export default Provider;
