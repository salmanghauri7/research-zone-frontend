"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EditMessageModalProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContent: string) => void;
}

export default function EditMessageModal({
  message,
  isOpen,
  onClose,
  onSave,
}: EditMessageModalProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && message) {
      setContent(message.content);
    }
  }, [isOpen, message]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      queueMicrotask(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(content.length, content.length);
      });
    }
  }, [isOpen, content]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200,
      )}px`;
    }
  }, [content]);

  const handleSave = useCallback(() => {
    if (content.trim()) {
      onSave(content.trim());
      setContent("");
    }
  }, [content, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const hasChanges =
    content.trim() && content.trim() !== (message?.content || "");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Edit your message..."
            className="resize-none min-h-[100px] max-h-[200px]"
          />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 font-mono">
              Enter
            </kbd>{" "}
            to save or{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 font-mono">
              Esc
            </kbd>{" "}
            to cancel
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
