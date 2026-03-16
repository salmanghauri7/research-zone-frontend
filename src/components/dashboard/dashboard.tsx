"use client";

import { useSideBar } from "@/contexts/SidebarContext";
import { useEffect, memo } from "react";
import dynamic from "next/dynamic";

// Lazy load dashboard components
const WelcomeCard = dynamic(() => import("./welcomeCard"), {
  loading: () => (
    <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
  ),
});

const ActiveWorkspaces = dynamic(() => import("./workspace/activeWorkspaces"), {
  loading: () => (
    <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse lg:col-span-2" />
  ),
});

const Dashboard = memo(function Dashboard() {
  const { closeWorkspace } = useSideBar();

  useEffect(() => {
    closeWorkspace();
  }, [closeWorkspace]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
      <div className="col-span-1 lg:col-span-3">
        <WelcomeCard />
      </div>
      <div className="col-span-1 lg:col-span-3">
        <ActiveWorkspaces />
      </div>
    </div>
  );
});

export default Dashboard;
