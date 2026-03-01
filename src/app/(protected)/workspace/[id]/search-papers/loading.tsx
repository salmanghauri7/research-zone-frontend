export default function PapersLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-3"
          >
            <div className="h-4 w-3/4 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            <div className="h-20 bg-[var(--bg-tertiary)] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
