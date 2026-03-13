export default function PaperChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-lg w-full px-6">
        {/* Icon skeleton */}
        <div className="w-20 h-20 rounded-3xl bg-[var(--bg-tertiary)] animate-pulse" />

        {/* Title skeleton */}
        <div className="space-y-2 w-full flex flex-col items-center">
          <div className="h-7 w-64 bg-[var(--bg-tertiary)] rounded-lg animate-pulse" />
          <div className="h-4 w-80 bg-[var(--bg-tertiary)] rounded animate-pulse" />
        </div>

        {/* Button skeleton */}
        <div className="h-12 w-48 bg-[var(--bg-tertiary)] rounded-2xl animate-pulse" />

        {/* Prompt cards skeleton */}
        <div className="w-full grid grid-cols-2 gap-2.5 mt-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
