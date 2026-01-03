"use client";

import { useModal } from "@/contexts/ModalContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSideBar } from "@/contexts/SidebarContext";
import { useForm } from "react-hook-form";
import workspaceApi from "@/api/workspaceApi";
import { useRouter } from "next/navigation";

type CreateWorkspaceFormData = {
  title: string;
};

export default function CreateWorkspaceModal() {
  const router = useRouter();
  const { isCreateWorkspaceOpen, closeModal } = useModal();
  const { isDark } = useTheme();
  const { setHasWorkspaces } = useSideBar();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }, // 1. Get isSubmitting
  } = useForm<CreateWorkspaceFormData>();

  const createWorkspace = async (data: CreateWorkspaceFormData) => {
    try {
      console.log("data", data);
      const res = await workspaceApi.createWorkspace(data);
      console.log(res);
      setHasWorkspaces(true); // Update context to show sidebar
      closeModal();
      router.push(`/workspace/${res.data.data.inviteCode}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isCreateWorkspaceOpen) return null;

  // Fixed typo: "rou}nded" -> "rounded"
  const surfaceClasses = `w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transform transition-all duration-300 ${isDark
    ? "bg-[#0C0F16] border-white/10 shadow-black/50"
    : "bg-white border-gray-200 shadow-[0_25px_80px_rgba(15,23,42,0.15)]"
    }`;

  // ... (keep your other color variables same as before) ...
  const sectionDivider = isDark ? "border-white/10" : "border-gray-200";
  const titleColor = isDark ? "text-white" : "text-gray-900";
  const subtitleColor = isDark ? "text-white/60" : "text-gray-500";
  const labelColor = isDark ? "text-white/70" : "text-gray-600";
  const inputClasses = `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${isDark
    ? "bg-white/5 border-white/15 text-white placeholder-white/40 focus:ring-white/30 focus:border-white/30"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500/30 focus:border-blue-500"
    }`;

  // Added disabled styles for the button
  const primaryButtonClasses = `px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDark
    ? "bg-blue-500 text-white hover:bg-blue-400 focus-visible:ring-white/30 focus-visible:ring-offset-[#0C0F16]"
    : "bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-400 focus-visible:ring-offset-white"
    }`;
  const secondaryButtonClasses = `px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isDark
    ? "text-white/70 hover:text-white hover:bg-white/5 focus-visible:ring-white/20 focus-visible:ring-offset-[#0C0F16]"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-300 focus-visible:ring-offset-white"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6 bg-black/30 dark:bg-black/70 backdrop-blur-sm transition-colors"
      role="dialog"
      aria-modal="true"
    >
      <div className={surfaceClasses}>
        {/* 2. Changed <div> to <form> and added onSubmit */}
        <form onSubmit={handleSubmit(createWorkspace)}>
          <div
            className={`flex items-start justify-between gap-4 px-6 py-5 border-b ${sectionDivider}`}
          >
            <div>
              <h2 className={`text-xl font-semibold ${titleColor}`}>
                Create New Workspace
              </h2>
              <p className={`text-sm ${subtitleColor}`}>
                Give your space a name. You can invite collaborators later.
              </p>
            </div>
            <button
              type="button" // Explicitly set close button to type="button" so it doesn't submit form
              onClick={closeModal}
              className={`p-2 rounded-full transition-colors ${isDark
                ? "text-white/60 hover:text-white hover:bg-white/10"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              {/* SVG Icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${labelColor}`}>
                Workspace Name
              </label>
              <input
                type="text"
                placeholder="e.g. AI Research Group"
                className={inputClasses}
                autoFocus
                disabled={isSubmitting} // Disable input while submitting
                {...register("title", {
                  required: "Title is required",
                  //   validate: (value) =>
                  //     value.trim().split(/\s+/).length >= 2 ||
                  //     "Must be at least two words",
                })}
              />
              {errors.title && (
                <p className="text-red-500">{errors.title.message}</p>
              )}
            </div>
            {/* Info Box */}
            <div
              className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${isDark
                ? "border-white/10 bg-white/5 text-white/70"
                : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
            >
              <p>Workspaces keep research, discussions, and files together.</p>
              <p>Add teammates later from the workspace settings.</p>
            </div>
          </div>

          <div className={`px-6 py-4 border-t ${sectionDivider}`}>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className={secondaryButtonClasses}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              {/* 3. Changed onClick to type="submit" */}
              <button
                type="submit"
                className={primaryButtonClasses}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
