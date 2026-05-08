"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, X, Loader2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from "@/shared/components/ui";

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
              className="relative w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-[var(--bg-primary)] shadow-xl border border-[var(--border-primary)]">
                <form onSubmit={handleSubmit}>
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
                          {mode === "create"
                            ? "Create Folder"
                            : "Rename Folder"}
                        </h2>
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {mode === "create"
                            ? "Create a new folder to organize your papers"
                            : "Enter a new name for the folder"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="p-2 h-9 w-9"
                    >
                      <X size={18} />
                    </Button>
                  </div>

                  <CardContent className="px-6 py-5 space-y-4">
                    <div className="space-y-2">
                      <Label>Folder Name</Label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError("");
                        }}
                        placeholder="e.g. Deep Learning Papers"
                        autoFocus
                        disabled={isSubmitting}
                      />
                      {error && (
                        <p className="text-sm text-[var(--error)]">{error}</p>
                      )}
                    </div>
                  </CardContent>

                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !name.trim()}
                      className="gap-2"
                    >
                      {isSubmitting && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      {isSubmitting
                        ? mode === "create"
                          ? "Creating..."
                          : "Saving..."
                        : mode === "create"
                          ? "Create Folder"
                          : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
