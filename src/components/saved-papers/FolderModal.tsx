"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, X, Loader2 } from "lucide-react";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
  initialName?: string;
}

export default function FolderModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  mode,
  initialName = "",
}: FolderModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset form state when modal opens
  if (isOpen && !isInitialized) {
    setName(initialName);
    setError("");
    setIsInitialized(true);
  } else if (!isOpen && isInitialized) {
    setIsInitialized(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Folder name is required");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Folder name must be less than 100 characters");
      return;
    }

    // Check for invalid characters
    if (/[<>:"/\\|?*]/.test(trimmedName)) {
      setError("Folder name contains invalid characters");
      return;
    }

    onSubmit(trimmedName);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[var(--bg-primary)] rounded-2xl  border border-[var(--border-primary)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-primary)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10">
                      <FolderPlus size={20} className="text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        {mode === "create" ? "Create Folder" : "Rename Folder"}
                      </h2>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        {mode === "create"
                          ? "Create a new folder to organize your papers"
                          : "Enter a new name for the folder"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--text-secondary)]">
                      Folder Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. Deep Learning Papers"
                      className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)] transition-colors"
                      autoFocus
                      disabled={isSubmitting}
                    />
                    {error && (
                      <p className="text-sm text-[var(--error)]">{error}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 text-sm font-medium rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {isSubmitting
                      ? mode === "create"
                        ? "Creating..."
                        : "Saving..."
                      : mode === "create"
                        ? "Create Folder"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
