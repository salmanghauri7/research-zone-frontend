"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  folderName: string;
}

export default function DeleteFolderModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  folderName,
}: DeleteFolderModalProps) {
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
              className="relative w-full max-w-sm bg-[var(--bg-primary)] rounded-xl  border border-[var(--border-primary)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-1 rounded-lg transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              >
                <X size={20} />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Icon */}
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--error-light)] mb-4">
                  <AlertTriangle size={20} className="text-[var(--error)]" />
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1.5">
                  Delete folder?
                </h2>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    &ldquo;{folderName}&rdquo;
                  </span>
                  ? This will permanently delete all contents inside.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors bg-[var(--error)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeleting && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
