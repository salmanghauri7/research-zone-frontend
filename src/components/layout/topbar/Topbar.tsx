"use client";

import { memo, useCallback } from "react";
import { LogOut, Search, Bell } from "lucide-react";
import { logout } from "@/utils/logout";

const Topbar = memo(function Topbar() {
  const handleLogout = useCallback(() => {
    logout();
  }, []);

  return (
    <header className="w-full h-14 fixed top-0 left-0 z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm ">
          R
        </div>
        <span className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
          ResearchZone
        </span>
      </div>

      {/* Center: Search (optional - hidden on mobile) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            type="text"
            placeholder="Search papers, projects..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-slate-200 dark:border-slate-800 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all relative"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent-primary)] rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--border-primary)] mx-1" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-all"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
});

export default Topbar;
