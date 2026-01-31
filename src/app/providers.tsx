"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { WorkspaceProvider } from "@/contexts/SidebarContext";
import { SocketProvider } from "@/contexts/SocketContext";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider>
          <ModalProvider>
            <WorkspaceProvider>{children}</WorkspaceProvider>
          </ModalProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </SocketProvider>
  );
}
