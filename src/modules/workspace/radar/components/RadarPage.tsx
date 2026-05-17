"use client";

import RadarHeader from "./RadarHeader";
import RadarCategorySelector from "./RadarCategorySelector";
import RadarFindingsStream from "./RadarFindingsStream";
import RadarAlertsPlaceholder from "./RadarAlertsPlaceholder";
import { useRadar } from "../hooks";

export default function RadarPage() {
  const {
    categories,
    selectedCategories,
    isLoadingCategories,
    categoriesError,
    status,
    isStarting,
    totalCategories,
    completedCategories,
    findings,
    previousAlerts,
    isLoadingPreviousAlerts,
    previousAlertsError,
    summary,
    refreshCategories,
    toggleCategory,
    selectAllCategories,
    clearAllCategories,
    startRun,
  } = useRadar();

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto flex flex-col gap-6">
      <RadarHeader
        status={status}
        isStarting={isStarting}
        selectedCount={summary.selectedCount}
        totalCategories={totalCategories}
        completedCategories={summary.completedCount}
        findingsCount={summary.findingsCount}
        onStart={startRun}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
        <RadarCategorySelector
          categories={categories}
          selectedCategories={selectedCategories}
          isLoading={isLoadingCategories}
          error={categoriesError}
          onToggle={toggleCategory}
          onSelectAll={selectAllCategories}
          onClearAll={clearAllCategories}
          onRefresh={refreshCategories}
        />

        <RadarFindingsStream
          findings={findings}
          status={status}
          totalCategories={totalCategories}
          completedCategories={summary.completedCount}
        />
      </div>

      <RadarAlertsPlaceholder
        alerts={previousAlerts}
        isLoading={isLoadingPreviousAlerts}
        error={previousAlertsError}
      />
    </div>
  );
}
