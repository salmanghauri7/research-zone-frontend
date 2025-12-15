"use client";

import { useSideBar } from "@/contexts/SidebarContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { closeWorkspace } = useSideBar();
  useEffect(() => {
    closeWorkspace();
  });
  return (
    <div className="text-black dark:text-white dark:bg-black">
      This is dashboard page
    </div>
  );
}
