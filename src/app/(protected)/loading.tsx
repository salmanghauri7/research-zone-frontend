export default function ProtectedLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--border-primary)]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--accent-primary)] animate-spin"></div>
        </div>
        <span className="text-sm font-medium text-[var(--text-muted)]">
          Loading...
        </span>
      </div>
    </div>
  );
}
