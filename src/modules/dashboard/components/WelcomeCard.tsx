"use client";

import { memo } from "react";
import { BookOpen, Plus } from "lucide-react";
import { Card, CardContent, Button } from "@/shared/components/ui";
import useWelcomeCard from "@/modules/dashboard/hooks/useWelcomeCard";

const WelcomeCard = memo(function WelcomeCard() {
  const { handleCreateWorkspace } = useWelcomeCard();

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-300 rounded-full blur-3xl" />
      </div>

      <CardContent className="relative z-10 p-8">
        <div className="flex items-center justify-between">
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
              <Button className="bg-white text-teal-700 hover:bg-white/90 font-semibold gap-2">
                <BookOpen size={18} />
                Discover Papers
              </Button>
              <Button
                onClick={handleCreateWorkspace}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-semibold gap-2"
              >
                <Plus size={18} />
                New Workspace
              </Button>
            </div>
          </div>

          {/* Stats area */}
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
      </CardContent>
    </Card>
  );
});

export default WelcomeCard;
