"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import Topbar from "@/components/layout/topbar/Topbar";
import { usePathname } from "next/navigation";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/dashboard";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Topbar stays fixed */}
      <Topbar />

      <div className="flex pt-16">
        {/* Sidebar - hidden on dashboard route */}
        {showSidebar && <Sidebar />}

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
