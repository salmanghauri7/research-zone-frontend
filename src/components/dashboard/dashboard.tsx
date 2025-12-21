"use client";

import { useSideBar } from "@/contexts/SidebarContext";
import { useEffect } from "react";
import WelcomeCard from "./welcomeCard";
import ActiveWorkspaces from "./workspace/activeWorkspaces";

export default function Dashboard() {
  const { closeWorkspace } = useSideBar();
  useEffect(() => {
    closeWorkspace();
  });
  return (
    <div className="w-full space-y-6">
      <WelcomeCard />
      <ActiveWorkspaces />
    </div>
  );
}
