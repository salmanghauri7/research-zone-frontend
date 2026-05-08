"use client";

import { useModal } from "@/contexts/ModalContext";
import { useForm } from "react-hook-form";
import workspaceApi from "@/api/workspaceApi";
import { useRouter } from "next/navigation";
import { FolderPlus, Info, X } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from "@/shared/components/ui";

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
      <Card
        className="w-full max-w-md overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit(createWorkspace)}>
          <div className="flex items-center justify-between border-b border-[var(--border-primary)] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--accent-primary)]/10 p-2">
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
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={closeModal}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={18} />
            </Button>
          </div>

          <CardContent className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label
                htmlFor="workspace-title"
                className="text-[var(--text-secondary)]"
              >
                Workspace Name
              </Label>
              <Input
                id="workspace-title"
                type="text"
                placeholder="e.g. AI Research Group"
                autoFocus
                disabled={isSubmitting}
                className="bg-[var(--bg-secondary)]"
                {...register("title", {
                  required: "Title is required",
                })}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="flex gap-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3">
              <Info
                size={16}
                className="mt-0.5 shrink-0 text-[var(--accent-primary)]"
              />
              <div className="text-xs leading-relaxed text-[var(--text-muted)]">
                <p>
                  Workspaces keep research, discussions, and files together.
                </p>
                <p className="mt-1">
                  Add teammates later from the workspace settings.
                </p>
              </div>
            </div>
          </CardContent>

          <div className="flex justify-end gap-3 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]"
            >
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
