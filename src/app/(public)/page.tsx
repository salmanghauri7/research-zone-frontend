"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Menu, X, Beaker } from "lucide-react";

// ------------------- Navigation -------------------
const Navigation: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const handleSignup = (): void => router.push("/auth/signup");
  const handleSignin = (): void => router.push("/auth/login");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
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
            <button
              onClick={handleSignin}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={handleSignup}
              className="bg-[var(--accent-primary)] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[var(--accent-hover)] transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[var(--bg-primary)] border-b border-[var(--border-primary)] p-4 flex flex-col space-y-4 animate-fade-in">
          <a className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
            Features
          </a>
          <a className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
            Pricing
          </a>
          <a className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
            FAQ
          </a>
          <hr className="border-[var(--border-primary)]" />
          <button
            onClick={handleSignin}
            className="w-full text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
          >
            Sign In
          </button>
          <button
            onClick={handleSignup}
            className="w-full bg-[var(--accent-primary)] text-white font-medium py-2.5 rounded-xl text-center"
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
          <button className="px-8 py-4 bg-[var(--accent-primary)] text-white font-semibold rounded-xl hover:bg-[var(--accent-secondary)] transition-all  -teal-500/20 flex items-center gap-2 justify-center">
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
