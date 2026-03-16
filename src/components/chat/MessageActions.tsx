"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "./types";
import {
  FiCornerUpLeft,
  FiMoreHorizontal,
  FiMessageSquare,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

interface MessageActionsProps {
  message: Message;
  isOwn?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onThreadOpen?: (message: Message) => void;
}

interface TooltipProps {
  children: React.ReactNode;
  label: string;
}

function Tooltip({ children, label }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap z-50 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {label}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-100" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MessageActions({
  message,
  isOwn = false,
  onReply,
  onEdit,
  onDelete,
  onThreadOpen,
}: MessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="absolute -top-3 right-6 flex items-center gap-0.5 px-1 py-0.5 rounded-xl border  bg-white border-slate-200 dark:bg-slate-900 dark:border-white/10"
    >
      {/* Reply Button */}
      <Tooltip label="Reply">
        <button
          onClick={() => onReply?.(message)}
          className="p-1.5 rounded-md transition-colors hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white"
        >
          <FiCornerUpLeft className="w-4 h-4" />
        </button>
      </Tooltip>

      {/* Thread Button */}
      <Tooltip label="Reply in thread">
        <button
          onClick={() => onThreadOpen?.(message)}
          className="p-1.5 rounded-md transition-colors hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white"
        >
          <FiMessageSquare className="w-4 h-4" />
        </button>
      </Tooltip>

      {/* More Options - Only show for own messages */}
      {isOwn && (
        <div className="relative" ref={menuRef}>
          <Tooltip label="More actions">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-md transition-colors hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white"
            >
              <FiMoreHorizontal className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-1 min-w-40 rounded-xl border  z-50 overflow-hidden bg-white border-slate-200 dark:bg-slate-900 dark:border-white/10"
              >
                {/* Edit Message */}
                <button
                  onClick={() => {
                    onEdit?.(message);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit message</span>
                </button>

                {/* Delete Message */}
                <button
                  onClick={() => {
                    onDelete?.(message.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete message</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
