"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Activity, Archive } from "lucide-react";
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
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-[-webkit-fill-available]">
      <div className="bg-(--bg-primary) border border-(--border-primary) rounded-2xl md:rounded-3xl shadow-xs overflow-hidden flex flex-col h-[calc(100vh-6rem)] min-h-[700px]">
        {/* Unified Header spanning full width */}
        <div className="border-b border-(--border-primary) bg-(--bg-secondary)/30 shrink-0">
          <RadarHeader
            status={status}
            isStarting={isStarting}
            selectedCount={summary.selectedCount}
            totalCategories={totalCategories}
            completedCategories={summary.completedCount}
            findingsCount={summary.findingsCount}
            onStart={startRun}
          />
        </div>

        {/* Main Content split */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Sidebar for Categories */}
          <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-(--border-primary) bg-(--bg-secondary)/10">
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
          </div>

          {/* Main Workspace Area with Tabs */}
          <div className="flex-1 flex flex-col min-w-0 bg-(--bg-primary) overflow-hidden relative">
            <Tabs.Root
              defaultValue="live"
              className="flex-1 flex flex-col h-full"
            >
              <Tabs.List className="flex items-center px-4 lg:px-6 border-b border-(--border-primary) bg-(--bg-primary) shrink-0">
                <Tabs.Trigger
                  value="live"
                  className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-(--text-secondary) border-b-2 border-transparent data-[state=active]:border-(--accent-primary) data-[state=active]:text-(--accent-primary) hover:text-(--text-primary) transition-colors outline-none"
                >
                  <Activity className="w-4 h-4" /> Live Scope
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="saved"
                  className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-(--text-secondary) border-b-2 border-transparent data-[state=active]:border-(--accent-primary) data-[state=active]:text-(--accent-primary) hover:text-(--text-primary) transition-colors outline-none"
                >
                  <Archive className="w-4 h-4" /> Saved Alerts
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content
                value="live"
                className="flex-1 overflow-hidden outline-none data-[state=inactive]:hidden"
              >
                <RadarFindingsStream
                  findings={findings}
                  status={status}
                  totalCategories={totalCategories}
                  completedCategories={summary.completedCount}
                />
              </Tabs.Content>

              <Tabs.Content
                value="saved"
                className="flex-1 overflow-hidden outline-none data-[state=inactive]:hidden"
              >
                <RadarAlertsPlaceholder
                  alerts={previousAlerts}
                  isLoading={isLoadingPreviousAlerts}
                  error={previousAlertsError}
                />
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
