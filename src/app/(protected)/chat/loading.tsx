export default function ChatLoading() {
  return (
    <div className="flex h-full min-h-0">
      {/* Main Chat Area Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header Skeleton */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-[var(--bg-tertiary)] rounded animate-pulse" />
              <div className="h-3 w-16 bg-[var(--bg-tertiary)] rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
            >
              <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] animate-pulse shrink-0" />
              <div className={`space-y-2 ${i % 2 === 0 ? "" : "items-end"}`}>
                <div className="h-3 w-20 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                <div className="h-16 w-64 bg-[var(--bg-tertiary)] rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Input Skeleton */}
        <div className="p-4 border-t border-[var(--border-primary)]">
          <div className="h-12 bg-[var(--bg-tertiary)] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
