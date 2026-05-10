"use client";

import { useEffect, memo } from "react";
import { useSideBar } from "@/contexts/SidebarContext";
import WelcomeCard from "./WelcomeCard";
import ActiveWorkspaces from "./ActiveWorkspaces";

const DashboardPage = memo(function DashboardPage() {
  const { closeWorkspace } = useSideBar();

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

export default DashboardPage;
