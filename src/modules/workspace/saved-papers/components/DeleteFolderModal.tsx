"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Button, Card, CardContent } from "@/shared/components/ui";

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
              className="relative w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-[var(--bg-primary)] shadow-xl border border-[var(--border-primary)]">
                <Button
                  onClick={onClose}
                  disabled={isDeleting}
                  variant="ghost"
                  className="absolute top-4 right-4 h-9 w-9 p-0"
                >
                  <X size={20} />
                </Button>

                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--error-light)] mb-4">
                    <AlertTriangle size={20} className="text-[var(--error)]" />
                  </div>

                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1.5">
                    Delete folder?
                  </h2>

                  <p className="text-sm text-[var(--text-secondary)] mb-6">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-[var(--text-primary)]">
                      &ldquo;{folderName}&rdquo;
                    </span>
                    ? This will permanently delete all contents inside.
                  </p>

                  <div className="flex gap-3">
                    <Button
                      onClick={onClose}
                      disabled={isDeleting}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onConfirm}
                      disabled={isDeleting}
                      className="flex-1 gap-2 bg-[var(--error)] hover:bg-[var(--error)]/90 text-white"
                    >
                      {isDeleting && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
