"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sun, Moon, Monitor, Menu, X, Beaker } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Type for theme options
type ThemeOption = "light" | "dark" | "system";

// ------------------- Navigation -------------------
const Navigation: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme, mounted } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState<boolean>(false);

  const themeRef = useRef<HTMLDivElement>(null);

  // Close theme dropdown if clicking outside
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

  const handleSignup = (): void => router.push("/auth/signup");
  const handleSignin = (): void => router.push("/auth/login");

  const handleThemeSelect = (selectedTheme: ThemeOption) => {
    setTheme(selectedTheme);
    setThemeMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Beaker size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
              ResearchZone
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
              Features
            </a>
            <a className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
              Pricing
            </a>
            <a className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
              FAQ
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Dropdown */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-all"
              >
                {!mounted ? (
                  <Sun size={18} />
                ) : (
                  <>
                    {theme === "light" && <Sun size={18} />}
                    {theme === "dark" && <Moon size={18} />}
                    {theme === "system" && <Monitor size={18} />}
                  </>
                )}
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] shadow-xl rounded-xl w-40 p-1.5 animate-fade-in">
                  {(["light", "dark", "system"] as ThemeOption[]).map(
                    (option) => (
                      <button
                        key={option}
                        onClick={() => handleThemeSelect(option)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--bg-secondary)] w-full text-left text-sm transition-colors ${theme === option ? "bg-[var(--bg-secondary)] text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}
                      >
                        {option === "light" && <Sun size={15} />}
                        {option === "dark" && <Moon size={15} />}
                        {option === "system" && <Monitor size={15} />}
                        <span>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSignin}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={handleSignup}
              className="bg-[var(--accent-primary)] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[var(--accent-secondary)] transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[var(--text-primary)]"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[var(--bg-primary)] border-b border-[var(--border-primary)] p-4 flex flex-col space-y-3 shadow-lg animate-fade-in">
          <a className="text-base font-medium text-[var(--text-secondary)] py-2">
            Features
          </a>
          <a className="text-base font-medium text-[var(--text-secondary)] py-2">
            Pricing
          </a>
          <a className="text-base font-medium text-[var(--text-secondary)] py-2">
            FAQ
          </a>
          <div className="h-px bg-[var(--border-primary)]" />
          <button
            onClick={handleSignin}
            className="text-base text-[var(--text-primary)] py-2 text-left"
          >
            Sign In
          </button>
          <button
            onClick={handleSignup}
            className="bg-[var(--accent-primary)] text-white text-center font-medium px-4 py-3 rounded-xl"
          >
            Get Started
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
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
          Now in public beta
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] mb-6 leading-[1.1]">
          Research collaboration <br className="hidden md:block" />
          made simple
        </h1>

        <p className="text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
          Organize papers, collaborate with your team, and accelerate
          discoveries with a unified research workspace.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 bg-[var(--accent-primary)] text-white font-semibold rounded-xl hover:bg-[var(--accent-secondary)] transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 justify-center">
            Start For Free <ArrowRight size={18} />
          </button>

          <button className="px-8 py-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-all">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
};

// ------------------- APP -------------------
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
      <Navigation />
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default App;
