"use client";

import { ArrowLeft, LogOut, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useWorkspaceSettings } from "@/modules/workspace/settings/hooks";

export default function WorkspaceSettingsPage() {
  const {
    currentWorkspaceId,
    isOwner,
    workspaceTitle,
    isLeaving,
    showConfirmation,
    handleLeaveWorkspace,
    handleShowConfirmation,
    handleCancelConfirmation,
  } = useWorkspaceSettings();

  if (!currentWorkspaceId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-muted)]">
            Loading workspace settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href={`/workspace/${currentWorkspaceId}`}
            className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)] sm:mb-4"
          >
            <ArrowLeft size={16} />
            Back to Workspace
          </Link>
          <div className="rounded-2xl border border-[var(--border-primary)] bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] p-4 sm:p-5 lg:p-6">
            <h1 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              Workspace Settings
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
              {workspaceTitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Workspace Role Card */}
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 sm:p-5 lg:p-6">
            <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)] sm:text-lg">
              Your Role
            </h2>
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
              <div
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${
                  isOwner
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                }`}
              >
                {isOwner ? "Owner" : "Member"}
              </div>
              <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
                {isOwner
                  ? "You have full access and control over this workspace"
                  : "You have shared access to this workspace"}
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 sm:p-5 lg:p-6">
            <h2 className="mb-2 text-base font-semibold text-[var(--text-primary)] sm:text-lg">
              Danger Zone
            </h2>
            <p className="mb-4 text-xs text-[var(--text-muted)] sm:mb-6 sm:text-sm">
              Irreversible actions that affect your workspace access
            </p>

            {!showConfirmation ? (
              <button
                onClick={handleShowConfirmation}
                className="group flex w-full flex-col items-start justify-between gap-3 rounded-xl border-2 border-red-200 bg-red-50/50 p-3 transition-all hover:bg-red-100/70 dark:border-red-900/30 dark:bg-red-950/20 dark:hover:bg-red-950/40 sm:flex-row sm:items-center sm:gap-4 sm:p-4 lg:p-5"
              >
                <div className="flex w-full items-center gap-3 sm:gap-4">
                  {isOwner ? (
                    <div className="shrink-0 rounded-xl bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400 sm:p-3">
                      <Trash2 size={18} className="sm:h-5 sm:w-5" />
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-xl bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400 sm:p-3">
                      <LogOut size={18} className="sm:h-5 sm:w-5" />
                    </div>
                  )}
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 sm:text-base">
                      {isOwner ? "Delete Workspace" : "Leave Workspace"}
                    </p>
                    <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-400/80 sm:text-sm">
                      {isOwner
                        ? "Permanently delete this workspace and all its data"
                        : "Remove yourself from this workspace"}
                    </p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 shrink-0 text-red-400 transition-transform group-hover:translate-x-1 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              /* Confirmation Section */
              <div className="space-y-4 rounded-xl border-2 border-red-200 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20 sm:space-y-6 sm:p-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="shrink-0 rounded-full bg-red-100 p-2 dark:bg-red-900/30 sm:p-3">
                    <AlertTriangle
                      size={20}
                      className="text-red-600 dark:text-red-400 sm:h-6 sm:w-6"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1 text-base font-semibold text-red-700 dark:text-red-400 sm:mb-2 sm:text-lg">
                      {isOwner
                        ? "Delete this workspace?"
                        : "Leave this workspace?"}
                    </h3>
                    <p className="text-xs text-red-600/90 dark:text-red-400/90 sm:text-sm">
                      {isOwner
                        ? "This will permanently delete the workspace and all its data. This action cannot be undone."
                        : "You will no longer have access to this workspace. You can be re-invited by the owner."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleCancelConfirmation}
                    disabled={isLeaving}
                    className="flex-1 rounded-xl border-2 border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-50 sm:px-5 sm:py-3 sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeaveWorkspace}
                    disabled={isLeaving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 sm:px-5 sm:py-3 sm:text-sm"
                  >
                    {isLeaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>
                          {isOwner ? "Deleting..." : "Leaving..."}
                        </span>
                      </>
                    ) : (
                      <>
                        {isOwner ? (
                          <>
                            <Trash2 size={16} className="sm:h-[18px] sm:w-[18px]" />
                            <span>Delete</span>
                          </>
                        ) : (
                          <>
                            <LogOut size={16} className="sm:h-[18px] sm:w-[18px]" />
                            <span>Leave</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
