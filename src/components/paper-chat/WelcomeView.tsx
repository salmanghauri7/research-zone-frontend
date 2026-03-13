"use client";

import { motion } from "framer-motion";
import {
  FileText,
  MessageSquareText,
  Lightbulb,
  BookOpenCheck,
  ArrowRight,
  Zap,
  Brain,
  Layers,
  Loader2,
} from "lucide-react";

interface WelcomeViewProps {
  onOpenPicker: () => void;
  isGeneratingEmbeddings?: boolean;
}

const suggestedPrompts = [
  { icon: Lightbulb, text: "Summarize the key findings" },
  { icon: Brain, text: "Explain the methodology" },
  { icon: Layers, text: "What are the limitations?" },
  { icon: Zap, text: "Compare with related work" },
];

export default function WelcomeView({
  onOpenPicker,
  isGeneratingEmbeddings,
}: WelcomeViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      <div className="max-w-lg w-full flex flex-col items-center">
        {/* Animated Icon Cluster */}
        <div className="relative mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 flex items-center justify-center"
          >
            <MessageSquareText
              size={36}
              className="text-[var(--accent-primary)]"
            />
          </motion.div>

          {/* Floating orbiting elements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 20 }}
            className="absolute -top-2 -right-4 w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center"
          >
            <FileText
              size={14}
              className="text-violet-500 dark:text-violet-400"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 20 }}
            className="absolute -bottom-1 -left-3 w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center"
          >
            <BookOpenCheck
              size={13}
              className="text-amber-500 dark:text-amber-400"
            />
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
            Chat with your papers
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-md leading-relaxed">
            Select a research paper and ask questions, get summaries, or explore
            ideas — powered by AI that understands your content.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={
            isGeneratingEmbeddings ? undefined : { scale: 1.02, y: -1 }
          }
          whileTap={isGeneratingEmbeddings ? undefined : { scale: 0.98 }}
          onClick={isGeneratingEmbeddings ? undefined : onOpenPicker}
          disabled={isGeneratingEmbeddings}
          className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[var(--accent-primary)] text-white font-medium text-sm shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/25 transition-all mb-10 disabled:opacity-80 disabled:cursor-not-allowed"
        >
          {isGeneratingEmbeddings ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Preparing Paper...</span>
            </>
          ) : (
            <>
              <FileText size={18} />
              <span>Choose a Paper</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </>
          )}
        </motion.button>

        {/* Suggested prompts preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full"
        >
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider text-center mb-3">
            Things you can ask
          </p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedPrompts.map((prompt, index) => {
              const Icon = prompt.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)] opacity-60"
                >
                  <Icon
                    size={15}
                    className="text-[var(--accent-primary)] shrink-0"
                  />
                  <span className="truncate text-xs">{prompt.text}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
