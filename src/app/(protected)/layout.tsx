"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import Topbar from "@/components/layout/topbar/Topbar";
import { useSideBar } from "@/contexts/SidebarContext";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { hasWorkspaces } = useSideBar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Topbar stays fixed */}
      <Topbar />

      <div className="flex pt-16">
        {/* Sidebar - only show when user has workspaces */}
        {hasWorkspaces && <Sidebar />}

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
