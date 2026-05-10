"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "../types";
import {
  CornerUpLeft,
  MoreHorizontal,
  MessageSquare,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap z-50 bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900"
          >
            {label}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800 dark:border-t-stone-100" />
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="absolute -top-3 right-6 flex items-center gap-0.5 px-1 py-0.5 rounded-lg border shadow-md bg-white border-stone-200 dark:bg-stone-900 dark:border-white/10"
    >
      {/* Reply Button */}
      <Tooltip label="Reply">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-stone-500 hover:text-stone-700 dark:text-white/50 dark:hover:text-white"
          onClick={() => onReply?.(message)}
        >
          <CornerUpLeft className="w-4 h-4" />
        </Button>
      </Tooltip>

      {/* Thread Button */}
      <Tooltip label="Reply in thread">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-stone-500 hover:text-stone-700 dark:text-white/50 dark:hover:text-white"
          onClick={() => onThreadOpen?.(message)}
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      </Tooltip>

      {/* More Options - Only show for own messages */}
      {isOwn && (
        <Popover open={showMenu} onOpenChange={setShowMenu}>
          <Tooltip label="More actions">
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-stone-500 hover:text-stone-700 dark:text-white/50 dark:hover:text-white"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
          </Tooltip>

          {/* Dropdown Menu */}
          <PopoverContent side="bottom" align="end" className="w-48 p-1">
            {/* Edit Message */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-stone-700 dark:text-white/70"
              onClick={() => {
                onEdit?.(message);
                setShowMenu(false);
              }}
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit message</span>
            </Button>

            {/* Delete Message */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => {
                onDelete?.(message.id || "");
                setShowMenu(false);
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete message</span>
            </Button>
          </PopoverContent>
        </Popover>
      )}
    </motion.div>
  );
}
