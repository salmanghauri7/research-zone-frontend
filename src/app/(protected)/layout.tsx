"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import Topbar from "@/components/layout/topbar/Topbar";
import { usePathname } from "next/navigation";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/dashboard";
  const isChatPage = pathname === "/chat";

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-black overflow-hidden">
      {/* Topbar stays fixed */}
      <Topbar />

      {/* Main container below topbar */}
      <div className="flex flex-1 pt-16 min-h-0">
        {/* Sidebar - hidden on dashboard route */}
        {showSidebar && <Sidebar />}

        {/* Main content */}
        <main className={`flex-1 min-h-0 ${isChatPage ? 'overflow-hidden' : 'overflow-auto p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
