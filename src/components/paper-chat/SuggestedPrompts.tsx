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
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Brain,
    label: "Methodology",
    text: "Explain the research methodology used in this paper in detail.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: ListChecks,
    label: "Summary",
    text: "Give me a concise summary of this paper with the most important points.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  {
    icon: Layers,
    label: "Limitations",
    text: "What are the limitations and potential weaknesses of this research?",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: GitCompareArrows,
    label: "Related Work",
    text: "How does this paper compare to related work in the field?",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: HelpCircle,
    label: "Open Questions",
    text: "What are the open questions and future directions suggested by this paper?",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 overflow-y-auto w-full w-full py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl w-full"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/20 to-emerald-500/20 rounded-2xl blur-lg" />
            <div className="relative w-full h-full rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm flex items-center justify-center">
              <BookOpenCheck
                size={28}
                strokeWidth={1.5}
                className="text-[var(--accent-primary)]"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
            Ready to explore
          </h2>
          <p className="text-[15px] text-[var(--text-secondary)]">
            Select a prompt below or ask your own question
          </p>
        </motion.div>

        {/* Prompts Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {prompts.map((prompt, index) => {
            const Icon = prompt.icon;
            return (
              <motion.button
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(prompt.text)}
                className={`flex flex-col items-start gap-3 p-5 rounded-2xl border bg-[var(--bg-secondary)] backdrop-blur-sm transition-all text-left group
                  border-[var(--border-primary)] hover:${prompt.border} hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--bg-primary)] focus:ring-[var(--accent-primary)]
                `}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${prompt.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner`}
                >
                  <Icon size={18} className={prompt.color} />
                </div>
                <div className="w-full flex-1">
                  <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--text-primary)] transition-colors">
                    {prompt.label}
                  </p>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-3 group-hover:text-[var(--text-primary)] transition-colors">
                    {prompt.text}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
