"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

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
