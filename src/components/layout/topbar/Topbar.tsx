"use client";

import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { Sun, Moon, Monitor, LogOut, Search, Bell } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { logout } from "@/utils/logout";

type ThemeOption = "light" | "dark" | "system";

const Topbar = memo(function Topbar() {
  const [themeMenuOpen, setThemeMenuOpen] = useState<boolean>(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, mounted } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeRef.current &&
        !themeRef.current.contains(event.target as Node)
      ) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeSelect = useCallback(
    (selectedTheme: ThemeOption) => {
      setTheme(selectedTheme);
      setThemeMenuOpen(false);
    },
    [setTheme],
  );

  const toggleThemeMenu = useCallback(() => {
    setThemeMenuOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, []);

  const ThemeIcon = useMemo(() => {
    if (!mounted) return <Sun size={18} />;
    if (theme === "light") return <Sun size={18} />;
    if (theme === "dark") return <Moon size={18} />;
    return <Monitor size={18} />;
  }, [theme, mounted]);

  const themeOptions: {
    value: ThemeOption;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "light", label: "Light", icon: <Sun size={16} /> },
    { value: "dark", label: "Dark", icon: <Moon size={16} /> },
    { value: "system", label: "System", icon: <Monitor size={16} /> },
  ];

  return (
    <header className="w-full h-14 fixed top-0 left-0 z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm ">
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

        {/* Theme Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={toggleThemeMenu}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
            title="Theme"
          >
            {ThemeIcon}
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 bg-[var(--bg-elevated)] border border-slate-200 dark:border-slate-800  rounded-xl w-36 p-1.5 animate-fade-in">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeSelect(option.value)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-all text-sm ${
                    theme === option.value
                      ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

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
