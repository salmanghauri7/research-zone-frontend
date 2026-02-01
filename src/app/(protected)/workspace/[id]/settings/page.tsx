"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Trash2, AlertTriangle } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import workspaceApi from "@/api/workspaceApi";
import Link from "next/link";
import Toast, { ToastType } from "@/components/Toast";

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { currentWorkspaceId, isOwner, workspaceTitle } = useWorkspaceStore();
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const handleLeaveWorkspace = async () => {
    if (!currentWorkspaceId) return;

    setIsLeaving(true);
    try {
      await workspaceApi.leaveWorkspace(currentWorkspaceId);
      setToast({
        message: `Workspace ${isOwner ? "deleted" : "left"} successfully`,
        type: "success",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to leave workspace:", error);
      setToast({
        message: "Failed to leave workspace. Please try again.",
        type: "error",
      });
      alert("Failed to leave workspace. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

  if (!currentWorkspaceId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-[var(--text-muted)]">
            Loading workspace settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen bg-[var(--bg-primary)] p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/workspace/${currentWorkspaceId}`}
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Back to Workspace
            </Link>
            <div className="bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-primary)]">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Workspace Settings
              </h1>
              <p className="text-[var(--text-secondary)] mt-2">
                {workspaceTitle}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Workspace Role Card */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-primary)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Your Role
              </h2>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    isOwner
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  {isOwner ? "Owner" : "Member"}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {isOwner
                    ? "You have full access and control over this workspace"
                    : "You have shared access to this workspace"}
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-primary)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Danger Zone
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Irreversible actions that affect your workspace access
              </p>

              {!showConfirmation ? (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="w-full flex items-center justify-between p-5 rounded-xl border-2 border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/70 dark:hover:bg-red-950/40 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {isOwner ? (
                      <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        <Trash2 size={20} />
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        <LogOut size={20} />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-base font-semibold text-red-700 dark:text-red-400">
                        {isOwner ? "Delete Workspace" : "Leave Workspace"}
                      </p>
                      <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                        {isOwner
                          ? "Permanently delete this workspace and all its data"
                          : "Remove yourself from this workspace"}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-red-400 group-hover:translate-x-1 transition-transform"
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
                <div className="space-y-6 p-6 rounded-xl bg-red-50/50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/30">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 shrink-0">
                      <AlertTriangle
                        size={24}
                        className="text-red-600 dark:text-red-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                        {isOwner
                          ? "Delete this workspace?"
                          : "Leave this workspace?"}
                      </h3>
                      <p className="text-sm text-red-600/90 dark:text-red-400/90">
                        {isOwner
                          ? "This will permanently delete the workspace and all its data. This action cannot be undone."
                          : "You will no longer have access to this workspace. You can be re-invited by the owner."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmation(false)}
                      disabled={isLeaving}
                      className="flex-1 px-5 py-3 rounded-xl border-2 border-[var(--border-primary)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLeaveWorkspace}
                      disabled={isLeaving}
                      className="flex-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLeaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {isOwner ? "Deleting..." : "Leaving..."}
                        </>
                      ) : (
                        <>
                          {isOwner ? (
                            <>
                              <Trash2 size={18} />
                              Delete Workspace
                            </>
                          ) : (
                            <>
                              <LogOut size={18} />
                              Leave Workspace
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
    </>
  );
}
