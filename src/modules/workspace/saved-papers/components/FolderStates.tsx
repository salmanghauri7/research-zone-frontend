"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-xl bg-[var(--error-light)] flex items-center justify-center mb-4">
        <AlertTriangle size={32} className="text-[var(--error)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-[var(--text-secondary)] text-center mb-4">
        {message}
      </p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2
        size={32}
        className="animate-spin text-[var(--accent-primary)]"
      />
    </div>
  );
}
