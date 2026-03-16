"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX } from "react-icons/fi";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
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
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl  border border-slate-200 dark:border-white/6"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-xl transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Icon */}
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-100 dark:bg-red-500/15 mb-4">
                  <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-1.5">
                  Delete message?
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-500 dark:text-white/50 mb-6">
                  This action cannot be undone. The message will be permanently
                  removed.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-colors border bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-white/3 dark:text-white dark:border-white/10 dark:hover:bg-white/6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-colors bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
