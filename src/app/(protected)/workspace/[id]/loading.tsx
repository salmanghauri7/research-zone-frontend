export default function WorkspaceLoading() {
  return (
    <div className="space-y-6">
      {/* Workspace Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            <div className="h-3 w-32 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-28 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-40 bg-[var(--bg-tertiary)] rounded-xl animate-pulse" />
          <div className="h-32 bg-[var(--bg-tertiary)] rounded-xl animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-[var(--bg-tertiary)] rounded-xl animate-pulse" />
          <div className="h-32 bg-[var(--bg-tertiary)] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
