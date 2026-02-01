"use client";

import { ReactNode, memo, useMemo } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Dynamic imports for layout components - they're heavy with animations
const Sidebar = dynamic(
  () => import("@/components/layout/sidebar/Sidebar"),
  {
    ssr: false,
    loading: () => (
      <aside className="w-[72px] h-full border-r border-gray-200 dark:border-white/10 bg-white dark:bg-black" />
    ),
  }
);

const Topbar = dynamic(
  () => import("@/components/layout/topbar/Topbar"),
  {
    ssr: false,
    loading: () => (
      <header className="w-full h-16 fixed top-0 left-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-white/10" />
    ),
  }
);

// Memoize the layout to prevent re-renders when children change
const ProtectedLayout = memo(function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Memoize computed values
  const showSidebar = useMemo(() => pathname !== "/dashboard", [pathname]);
  const isChatPage = useMemo(() => pathname === "/chat", [pathname]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-black overflow-hidden">
      {/* Topbar stays fixed */}
      <Topbar />

      {/* Main container below topbar */}
      <div className="flex flex-1 pt-16 min-h-0">
        {/* Sidebar - hidden on dashboard route */}
        {showSidebar && <Sidebar />}

        {/* Main content */}
        <main
          className={`flex-1 min-h-0 ${isChatPage ? "overflow-hidden" : "overflow-auto p-6"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
});

export default ProtectedLayout;
