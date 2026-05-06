"use client";

import { useModal } from "@/contexts/ModalContext";
import { useForm } from "react-hook-form";
import workspaceApi from "@/api/workspaceApi";
import { useRouter } from "next/navigation";
import { X, FolderPlus, Info } from "lucide-react";

type CreateWorkspaceFormData = {
  title: string;
};

export default function CreateWorkspaceModal() {
  const router = useRouter();
  const { isCreateWorkspaceOpen, closeModal } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceFormData>();

  const createWorkspace = async (data: CreateWorkspaceFormData) => {
    try {
      const res = await workspaceApi.createWorkspace(data);
      closeModal();
      router.push(`/workspace/${res.data.data._id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isCreateWorkspaceOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit(createWorkspace)}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-primary)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10">
                <FolderPlus
                  size={20}
                  className="text-[var(--accent-primary)]"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Create Workspace
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Start a new project space
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Workspace Name
              </label>
              <input
                type="text"
                placeholder="e.g. AI Research Group"
                className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)] transition-colors"
                autoFocus
                disabled={isSubmitting}
                {...register("title", {
                  required: "Title is required",
                })}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="flex gap-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3">
              <Info
                size={16}
                className="text-[var(--accent-primary)] shrink-0 mt-0.5"
              />
              <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                <p>
                  Workspaces keep research, discussions, and files together.
                </p>
                <p className="mt-1">
                  Add teammates later from the workspace settings.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
