export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
        <div className="h-10 w-36 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
      </div>

      {/* Projects Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] animate-pulse" />
              <div className="h-5 w-32 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            </div>
            <div className="h-3 w-full bg-[var(--bg-tertiary)] rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-[var(--bg-tertiary)] rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
