"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sun, Moon, Laptop, Menu, X, Search } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Type for theme options
type ThemeOption = "light" | "dark" | "system";

// ------------------- Navigation -------------------
const Navigation: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState<boolean>(false);

  const themeRef = useRef<HTMLDivElement>(null);

  // Close theme dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignup = (): void => router.push("/auth/signup");
  const handleSignin = (): void => router.push("/auth/login");

  const handleThemeSelect = (selectedTheme: ThemeOption) => {
    setTheme(selectedTheme);
    setThemeMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-bold text-xl tracking-tight flex items-center gap-2 text-black dark:text-white">
              <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center">
                <Search size={16} strokeWidth={3} />
              </div>
              Search Collab
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-sm font-medium text-gray-600 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">Pricing</a>
            <a className="text-sm font-medium text-gray-600 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">

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
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 w-full text-left ${theme === option ? "bg-gray-100 dark:bg-white/10" : ""}`}
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

            <button
              onClick={handleSignin}
              className="text-sm font-medium text-black dark:text-white hover:scale-105 transition-transform"
            >
              Sign In
            </button>

            <button
              onClick={handleSignup}
              className="bg-black dark:bg-white text-white dark:text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 hover:scale-105 transition-all"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-black border-b border-gray-100 dark:border-white/10 p-4 flex flex-col space-y-4 shadow-lg animate-fade-in">
          <a className="text-base font-medium text-gray-600 dark:text-white/60">Pricing</a>
          <a className="text-base font-medium text-gray-600 dark:text-white/60">FAQ</a>
          <div className="h-px bg-gray-200 dark:bg-white/10" />
          <button onClick={handleSignin} className="text-base text-black dark:text-white">
            Sign In
          </button>
          <button
            onClick={handleSignup}
            className="bg-black dark:bg-white text-white dark:text-black text-center font-medium px-4 py-2.5 rounded-lg"
          >
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
};

// ------------------- HERO SECTION -------------------
const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black dark:text-white mb-6 leading-[1.1]">
          Seamless search collaboration <br className="hidden md:block" />
          in any application
        </h1>

        <p className="text-xl text-gray-500 dark:text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          One hotkey. Any app. Search together and watch your team's findings appear instantly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:opacity-90 hover:scale-105 transition-all shadow-lg flex items-center gap-2 justify-center">
            Try Search Collab Free <ArrowRight size={18} />
          </button>

          <button className="px-8 py-4 bg-white dark:bg-black text-black dark:text-white font-semibold rounded-full border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 hover:scale-105 transition-all shadow-lg">
            See It in Action
          </button>
        </div>
      </div>
    </section>
  );
};

// ------------------- APP -------------------
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans">
      <Navigation />
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default App;
