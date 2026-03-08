export default function SavedPapersLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 bg-[var(--bg-tertiary)] rounded animate-pulse" />
        <div className="h-4 w-4 bg-[var(--bg-tertiary)] rounded animate-pulse" />
        <div className="h-4 w-28 bg-[var(--bg-tertiary)] rounded animate-pulse" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          <div className="h-4 w-40 bg-[var(--bg-tertiary)] rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Sort/View Controls Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-8 w-32 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          <div className="h-8 w-8 bg-[var(--bg-tertiary)] rounded animate-pulse" />
        </div>
      </div>

      {/* Folders/Papers List Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-[var(--bg-tertiary)] rounded animate-pulse" />
              <div className="h-3 w-64 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
