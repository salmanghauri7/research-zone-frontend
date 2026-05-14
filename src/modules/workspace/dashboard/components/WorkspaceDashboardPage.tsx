"use client";

import { type ElementType } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BookMarked,
  BookOpen,
  ChevronRight,
  FlaskConical,
  RefreshCw,
  TrendingUp,
  Users,
  BarChart3,
  BrainCircuit,
} from "lucide-react";
import InviteModal from "@/components/dashboard/workspace/InviteModal";
import { useWorkspaceDashboard } from "@/modules/workspace/dashboard/hooks";

// ─── Utilities ───────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAPER_ICONS = [BookOpen, FlaskConical, BarChart3, BrainCircuit, Activity];
const AVATAR_GRADIENTS = [
  "from-teal-500 to-emerald-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--bg-tertiary)] ${className ?? ""}`}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1680px] space-y-4 p-4 sm:space-y-5 sm:p-5 lg:space-y-6 lg:p-8">
      <SkeletonPulse className="h-44 w-full rounded-2xl sm:h-52 lg:h-60" />
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-3 lg:col-span-8">
          <SkeletonPulse className="h-7 w-48" />
          {[...Array(4)].map((_, i) => (
            <SkeletonPulse key={i} className="h-16 w-full sm:h-[72px]" />
          ))}
        </div>
        <div className="space-y-3 lg:col-span-4">
          <SkeletonPulse className="h-7 w-36" />
          {[...Array(4)].map((_, i) => (
            <SkeletonPulse key={i} className="h-14 w-full sm:h-16" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: ElementType;
  label: string;
  value: number | string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm sm:gap-1.5 sm:px-5 sm:py-4 lg:flex-none lg:min-w-[110px] lg:px-7 lg:py-5"
    >
      <Icon size={15} className="mb-0.5 text-teal-400 sm:size-[17px] lg:size-[18px]" />
      <span className="text-[22px] font-bold leading-none text-white sm:text-2xl lg:text-3xl">
        {value}
      </span>
      <span className="text-center text-[9px] font-semibold uppercase tracking-widest text-white/50 sm:text-[10px] lg:text-xs">
        {label}
      </span>
    </motion.div>
  );
}

// ─── Activity Bars ────────────────────────────────────────────────────────────

function ActivityBars({ data }: { data: { day: string; value: number }[] }) {
  const max = Math.max(...data.map((p) => p.value), 1);
  return (
    <div className="flex h-14 w-full items-end gap-1 sm:h-16 sm:gap-1.5 lg:h-20">
      {data.map((point, i) => (
        <div key={`${point.day}-${i}`} className="group flex flex-1 flex-col items-center gap-1">
          <div
            className="relative w-full cursor-default rounded-sm bg-teal-500/20 transition-all duration-300 hover:bg-teal-500/50"
            style={{ height: `${Math.max((point.value / max) * 100, 8)}%` }}
          >
            <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs text-[var(--text-primary)] opacity-0 transition-opacity group-hover:opacity-100">
              {point.value}
            </div>
          </div>
          <span className="text-[8px] font-medium text-[var(--text-muted)] sm:text-[9px]">
            {point.day}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkspaceDashboardPage() {
  const {
    workspaceId,
    data,
    loading,
    error,
    activityData,
    isInviteModalOpen,
    handleRetry,
    handleOpenSearchPapers,
    handleOpenInviteModal,
    handleCloseInviteModal,
    handleOpenSavedPapers,
  } = useWorkspaceDashboard();

  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-sm text-[var(--text-secondary)]">
          {error ?? "Something went wrong."}
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    );
  }

  const { workspace, stats, topContributors, recentPapers } = data;

  return (
    <div className="mx-auto max-w-[1680px] p-4 sm:p-5 lg:p-8">

      {/* ════════════════════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-4 overflow-hidden rounded-2xl border border-teal-700/30 bg-gradient-to-br from-teal-900/40 via-teal-800/20 to-transparent p-4 sm:mb-5 sm:p-6 lg:mb-6 lg:p-8"
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-teal-500/10 blur-3xl sm:-right-24 sm:-top-24 sm:h-80 sm:w-80" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-emerald-600/10 blur-3xl sm:-bottom-10 sm:-left-10 sm:h-60 sm:w-60" />

        <div className="relative z-10 flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">

          {/* Left: text + buttons */}
          <div className="min-w-0 flex-1">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-teal-300 sm:mb-3 sm:text-xs">
              <Activity size={10} />
              Workspace Dashboard
            </span>

            <h1 className="mb-1.5 text-[22px] font-bold leading-tight text-white sm:text-2xl sm:mb-2 lg:text-3xl xl:text-4xl">
              {workspace.title}
            </h1>

            {!!workspace.description && (
              <p className="max-w-xl text-[13px] leading-relaxed text-[var(--text-secondary)] sm:text-sm lg:text-base">
                {workspace.description}
              </p>
            )}

            {/* Buttons: stacked on mobile, row on sm+ */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:gap-3">
              <button
                onClick={handleOpenSearchPapers}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:scale-[1.02] hover:bg-teal-500 active:scale-[0.98] sm:gap-2 sm:px-5 sm:text-sm"
              >
                <BookMarked size={13} className="sm:size-[15px]" />
                Discover Papers
              </button>
              <button
                onClick={handleOpenInviteModal}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-primary)] bg-white/5 px-3 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition-all hover:bg-white/10 sm:gap-2 sm:px-5 sm:text-sm"
              >
                <Users size={13} className="sm:size-[15px]" />
                Invite Members
              </button>
            </div>
          </div>

          {/* Right: stat cards — always a row */}
          <div className="flex w-full gap-2 sm:gap-3 lg:w-auto lg:shrink-0">
            <StatCard icon={Users}      label="Team Members" value={stats.totalMembers} delay={0.1} />
            <StatCard icon={BookMarked} label="Papers Saved"  value={stats.totalPapers}  delay={0.2} />
          </div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════
          BENTO GRID
          < lg  → single column (full width, stacked)
          ≥ lg  → 12-col grid (papers 8, right col 4)
      ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">

        {/* ── Recent Saved Papers ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 sm:p-5 lg:col-span-8 lg:p-6"
        >
          <div className="mb-4 flex items-center justify-between border-b border-[var(--border-primary)] pb-3 sm:mb-5 sm:pb-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] sm:text-base">
              <BookMarked size={15} className="text-teal-400 sm:size-[17px]" />
              Recent Saved Papers
            </h2>
            <button
              onClick={() => handleOpenSavedPapers()}
              className="text-[11px] font-medium text-teal-400 hover:underline sm:text-sm"
            >
              View all
            </button>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {recentPapers.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                No papers saved yet.
              </p>
            ) : (
              recentPapers.map((paper, i) => {
                const Icon = PAPER_ICONS[i % PAPER_ICONS.length];
                return (
                  <motion.button
                    key={paper._id}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    onClick={() => handleOpenSavedPapers(paper._id)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-3 text-left transition-all hover:border-teal-600/40 sm:gap-4 sm:p-4"
                  >
                    {/* Icon box */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-400 transition-colors group-hover:bg-teal-500/20 sm:h-11 sm:w-11">
                      <Icon size={15} className="sm:size-[18px]" />
                    </div>

                    {/* Title + meta */}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[13px] font-semibold text-[var(--text-primary)] transition-colors group-hover:text-teal-400 sm:text-sm">
                        {paper.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                        {paper.author} • Saved {formatDate(paper.savedAt)}
                      </p>
                    </div>

                    {/* Tag + chevron */}
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                      <span className="hidden rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-400 min-[400px]:inline-flex sm:px-2.5 sm:text-xs">
                        {paper.tag}
                      </span>
                      <ChevronRight size={14} className="text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 sm:size-4" />
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ── Right column ────────────────────────────────────── */}
        {/*
          On mobile/tablet: two cards sit side-by-side (sm:grid-cols-2)
          On laptop+: stacked single column
        */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:col-span-4 lg:flex lg:flex-col lg:gap-6">

          {/* Top Contributors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 sm:p-5 lg:p-6"
          >
            <div className="mb-4 border-b border-[var(--border-primary)] pb-3 sm:mb-5 sm:pb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                <Users size={15} className="text-teal-400 sm:size-[17px]" />
                Top Contributors
              </h2>
            </div>

            {/* Avatar stack */}
            {topContributors.length > 0 && (
              <div className="mb-4 flex items-center">
                {topContributors.slice(0, 4).map((member, i) => (
                  <div
                    key={member._id}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--bg-secondary)] bg-gradient-to-br text-[10px] font-bold text-white sm:h-9 sm:w-9 sm:text-xs ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}`}
                    style={{ marginLeft: i === 0 ? 0 : "-9px", zIndex: 4 - i }}
                    title={member.name}
                  >
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
                    ) : getInitials(member.name)}
                  </div>
                ))}
                {stats.totalMembers > 4 && (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--bg-secondary)] bg-[var(--bg-tertiary)] text-[9px] font-semibold text-[var(--text-muted)] sm:h-9 sm:w-9 sm:text-[10px]"
                    style={{ marginLeft: "-9px" }}
                  >
                    +{stats.totalMembers - 4}
                  </div>
                )}
              </div>
            )}

            {/* List */}
            <div className="space-y-2.5 sm:space-y-3">
              {topContributors.length === 0 ? (
                <p className="py-4 text-center text-xs text-[var(--text-muted)]">No members yet.</p>
              ) : (
                topContributors.map((member, i) => (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="flex items-center gap-2.5 sm:gap-3"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[10px] font-bold text-white shadow-sm sm:h-10 sm:w-10 sm:text-sm ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}`}
                    >
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="h-full w-full rounded-xl object-cover" />
                      ) : getInitials(member.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[var(--text-primary)] sm:text-sm">
                        {member.name}
                      </p>
                      <p className="truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                        {member.role}
                      </p>
                    </div>
                    <span className="shrink-0 text-[13px] font-bold text-teal-400 sm:text-sm">
                      {member.papersCount}{" "}
                      <span className="text-[10px] font-normal text-[var(--text-muted)] sm:text-xs">
                        papers
                      </span>
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Workspace Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="rounded-2xl border border-[var(--border-primary)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-4 sm:p-5 lg:p-6"
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] sm:mb-4 sm:text-xs">
              Workspace Activity
            </p>

            <ActivityBars data={activityData} />

            <div className="mt-3 flex items-start justify-between gap-2 sm:mt-4">
              <div>
                <p className="text-xl font-bold text-white sm:text-2xl">
                  {stats.activityChange >= 0 ? "+" : ""}{stats.activityChange}%
                </p>
                <p className="text-[10px] text-[var(--text-muted)] sm:text-xs">vs last month</p>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-[10px] font-semibold text-teal-400 sm:text-xs">
                  <TrendingUp size={10} className="sm:size-3" />
                  {stats.activityChange >= 0 ? "High Momentum" : "Slowing Down"}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] sm:text-xs">Active collaboration</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Invite Modal */}
      {workspaceId && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={handleCloseInviteModal}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}