"use client";

import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { useWorkspaceEvents } from "@/hooks/websocket";

// Lazy load WorkSpace component
const WorkSpace = dynamic(
  () => import("@/components/dashboard/workspace/WorkSpace"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    ),
  },
);

export default function WorkspacePage() {
  const params = useParams();

  

  

  return (
    <div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        }
      >
        <WorkSpace />
      </Suspense>
    </div>
  );
}
