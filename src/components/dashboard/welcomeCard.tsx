"use client";

import { useModal } from "@/contexts/ModalContext";
import { memo, useCallback } from "react";
import { BookOpen, Plus, ArrowRight } from "lucide-react";

const WelcomeCard = memo(function WelcomeCard() {
  const { openModal } = useModal();

  const handleCreateWorkspace = useCallback(() => {
    openModal();
  }, [openModal]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-300 rounded-full blur-3xl" />
      </div>

      <div className="relative z-0 flex items-center justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Your research hub
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome back to ResearchZone
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-6">
            Organize your papers, collaborate with your team, and accelerate
            your research discoveries.
          </p>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-black/10">
              <BookOpen size={18} />
              Discover Papers
            </button>
            <button
              onClick={handleCreateWorkspace}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              <Plus size={18} />
              New Workspace
            </button>
          </div>
        </div>

        {/* Stats or illustration area */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-center px-6 py-4 rounded-2xl bg-white/10 backdrop-blur">
            <p className="text-3xl font-bold text-white">12</p>
            <p className="text-sm text-white/60">Papers saved</p>
          </div>
          <div className="text-center px-6 py-4 rounded-2xl bg-white/10 backdrop-blur">
            <p className="text-3xl font-bold text-white">3</p>
            <p className="text-sm text-white/60">Workspaces</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default WelcomeCard;
