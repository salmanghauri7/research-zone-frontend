import { Suspense } from "react";
import Dashboard from "@/components/dashboard/dashboard";
import DashboardLoading from "./loading";

export default function page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
}
