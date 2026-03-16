"use client";
import { useState } from "react";
import workspaceApi from "@/api/workspaceApi";
import Toast, { ToastType } from "@/components/Toast";
import { X, Mail } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  workspaceId,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!email.trim()) return;

    setIsSending(true);
    try {
      const response = await workspaceApi.sendInvite(
        email,
        description,
        workspaceId,
      );
      setToast({ message: "Invitation sent successfully!", type: "success" });

      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setEmail("");
        setDescription("");
      }, 1500);
    } catch (error) {
      console.log(error);
      setToast({
        message: "Failed to send invitation. Please try again.",
        type: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (isSending) return; // Prevent closing while sending
    onClose();
    setEmail("");
    setDescription("");
    setToast(null);
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
        onClick={handleClose}
      >
        {/* Backdrop with blur effect */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Modal Container */}
        <div
          className="relative w-full max-w-lg transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[var(--bg-primary)] rounded-2xl  border border-[var(--border-primary)] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10">
                    <Mail size={18} className="text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      Send Workspace Invite
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                      Invite a collaborator to join
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSending}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-medium text-[var(--text-secondary)]"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="invite-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  disabled={isSending}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl 
                                             text-[var(--text-primary)] placeholder-[var(--text-muted)]
                                             focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]
                                             transition-all duration-200 disabled:opacity-50"
                />
              </div>

              {/* Description Textarea */}
              <div className="space-y-2">
                <label
                  htmlFor="invite-description"
                  className="block text-sm font-medium text-[var(--text-secondary)]"
                >
                  Invitation Message (Optional)
                </label>
                <textarea
                  id="invite-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a personal message to your invitation..."
                  rows={4}
                  disabled={isSending}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl 
                                             text-[var(--text-primary)] placeholder-[var(--text-muted)]
                                             focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]
                                             transition-all duration-200 resize-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Footer with Buttons */}
            <div className="px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleClose}
                  disabled={isSending}
                  className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                                             bg-[var(--bg-primary)] border border-[var(--border-primary)]
                                             rounded-xl hover:bg-[var(--bg-tertiary)]
                                             transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!email.trim() || isSending}
                  className="px-5 py-2.5 text-sm font-semibold text-white 
                                             bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]
                                             rounded-xl disabled:opacity-50 disabled:cursor-not-allowed
                                             transition-all duration-200  -teal-500/20"
                >
                  {isSending ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
