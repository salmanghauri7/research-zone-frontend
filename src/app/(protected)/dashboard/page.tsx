import { Suspense } from "react";
import DashboardPage from "@/modules/dashboard/components/DashboardPage";
import DashboardLoading from "./loading";

export default function page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardPage />
    </Suspense>
  );
}
