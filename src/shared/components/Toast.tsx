"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  const styles = {
    success:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    error: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg animate-slide-in-right ${styles[type]}`}
      style={{ maxWidth: "320px" }}
    >
      <div className="shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
