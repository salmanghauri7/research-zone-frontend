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
  Sparkles,
} from "lucide-react";

interface WelcomeViewProps {
  onOpenPicker: () => void;
  isGeneratingEmbeddings?: boolean;
}

const suggestedPrompts = [
  {
    icon: Lightbulb,
    text: "Summarize the key findings",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Brain,
    text: "Explain the methodology",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Layers,
    text: "What are the limitations?",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Zap,
    text: "Compare with related work",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function WelcomeView({
  onOpenPicker,
  isGeneratingEmbeddings,
}: WelcomeViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 overflow-y-auto w-full custom-scrollbar">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xl w-full flex flex-col items-center"
      >
        {/* Animated Icon Cluster */}
        <motion.div variants={itemVariants} className="relative mb-10">
          <div className="absolute inset-0 bg-[var(--accent-primary)]/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/5 ring-1 ring-[var(--accent-primary)]/20 flex items-center justify-center shadow-2xl backdrop-blur-xl transition-all">
            <MessageSquareText
              size={48}
              strokeWidth={1.5}
              className="text-[var(--accent-primary)]"
            />
          </div>

          {/* Floating orbiting elements */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 -right-6 w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xl flex items-center justify-center z-10"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
          </motion.div>

          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-2 -left-6 w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xl flex items-center justify-center z-10"
          >
            <BookOpenCheck className="w-5 h-5 text-emerald-500" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-10 w-full px-4"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-tight">
            Chat with your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-emerald-400">
              research
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            Select a paper from your library to ask questions, extract insights,
            and explore ideas with AI assistance.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="w-full max-w-sm mb-12">
          <button
            onClick={isGeneratingEmbeddings ? undefined : onOpenPicker}
            disabled={isGeneratingEmbeddings}
            className="group relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
            aria-label="Choose a paper to start chatting"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            {isGeneratingEmbeddings ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing Paper...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Choose a Paper</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </motion.div>

        {/* Suggested prompts preview */}
        <motion.div variants={itemVariants} className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-[var(--border-primary)]" />
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
              Example Queries
            </p>
            <div className="h-px flex-1 bg-[var(--border-primary)]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedPrompts.map((prompt, index) => {
              const Icon = prompt.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm group hover:bg-[var(--bg-secondary)] hover:border-[var(--border-secondary)] transition-all duration-300 cursor-default"
                >
                  <div
                    className={`w-8 h-8 rounded-xl ${prompt.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-4 h-4 ${prompt.color}`} />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors line-clamp-1">
                    {prompt.text}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
