"use client";

import { motion } from "framer-motion";
import {
  Lightbulb,
  Brain,
  Layers,
  BookOpenCheck,
  ListChecks,
  GitCompareArrows,
  HelpCircle,
} from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  {
    icon: Lightbulb,
    label: "Key Findings",
    text: "What are the main findings and contributions of this paper?",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Brain,
    label: "Methodology",
    text: "Explain the research methodology used in this paper in detail.",
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: ListChecks,
    label: "Summary",
    text: "Give me a concise summary of this paper with the most important points.",
    color: "text-teal-500 dark:text-teal-400",
    bg: "bg-teal-500/10",
  },
  {
    icon: Layers,
    label: "Limitations",
    text: "What are the limitations and potential weaknesses of this research?",
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: GitCompareArrows,
    label: "Related Work",
    text: "How does this paper compare to related work in the field?",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: HelpCircle,
    label: "Open Questions",
    text: "What are the open questions and future directions suggested by this paper?",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 overflow-y-auto">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <BookOpenCheck size={22} className="text-[var(--accent-primary)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Paper loaded — start exploring
          </h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            Pick a prompt below or type your own question
          </p>
        </motion.div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {prompts.map((prompt, index) => {
            const Icon = prompt.icon;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.04 }}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelect(prompt.text)}
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/30 hover:shadow-[var(--shadow-md)] transition-all text-left group"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${prompt.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={15} className={prompt.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">
                    {prompt.label}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] leading-relaxed line-clamp-2">
                    {prompt.text}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
