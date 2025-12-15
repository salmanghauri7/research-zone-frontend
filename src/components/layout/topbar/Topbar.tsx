"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { TopbarItems } from "./TopbarItems";
import { useTheme } from "@/contexts/ThemeContext";

// Type for theme options
type ThemeOption = "light" | "dark" | "system";

export default function Topbar() {
  const [themeMenuOpen, setThemeMenuOpen] = useState<boolean>(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Close dropdown when clicking outside
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

  const handleThemeSelect = (selectedTheme: ThemeOption) => {
    setTheme(selectedTheme);
    setThemeMenuOpen(false);
  };

  return (
    <header className="w-full h-16 fixed top-0 left-0 z-10 bg-white dark:bg-black px-6 py-3 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
      {/* Left Logo + Title */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold">
          R
        </div>
        <span className="text-black dark:text-white text-xl font-semibold">
          ResearchZone
        </span>
      </div>

      {/* Right Icons & Profile */}
      <div className="flex items-center gap-6 text-black/70 dark:text-white/70">
        {/* Existing Topbar Items */}
        {TopbarItems?.map((item: any, index: number) => (
          <div key={index}>{item.element}</div>
        ))}

        {/* Theme Dropdown */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="p-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
          >
            {theme === "light" && <Sun size={20} />}
            {theme === "dark" && <Moon size={20} />}
            {theme === "system" && <Laptop size={20} />}
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-xl rounded-xl w-40 p-2 animate-fade-in">
              {(["light", "dark", "system"] as ThemeOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => handleThemeSelect(option)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 w-full text-left ${
                    theme === option ? "bg-gray-100 dark:bg-white/10" : ""
                  }`}
                >
                  {option === "light" && <Sun size={16} />}
                  {option === "dark" && <Moon size={16} />}
                  {option === "system" && <Laptop size={16} />}
                  <span className="text-black dark:text-white">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
