"use client";

import { useSideBar } from "@/contexts/SidebarContext";
import { useEffect, memo } from "react";
import dynamic from "next/dynamic";

// Lazy load dashboard components
const WelcomeCard = dynamic(() => import("./welcomeCard"), {
  loading: () => (
    <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
  ),
});

const ActiveWorkspaces = dynamic(() => import("./workspace/activeWorkspaces"), {
  loading: () => (
    <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
  ),
});

const Dashboard = memo(function Dashboard() {
  const { closeWorkspace } = useSideBar();

  // Fix: Add empty dependency array to prevent infinite re-renders
  useEffect(() => {
    closeWorkspace();
  }, [closeWorkspace]);

  return (
    <div className="w-full space-y-6">
      <WelcomeCard />
      <ActiveWorkspaces />
    </div>
  );
});

export default Dashboard;
