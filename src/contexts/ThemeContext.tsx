"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";

type ThemeOption = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get initial theme from localStorage (runs only on client)
function getInitialTheme(): ThemeOption {
  if (typeof window === "undefined") return "light";
  const savedTheme = localStorage.getItem("theme") as ThemeOption | null;
  if (savedTheme) return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>(getInitialTheme);
  const [isDark, setIsDark] = useState(false);

  // Memoize setTheme callback
  const setTheme = useCallback((newTheme: ThemeOption) => {
    setThemeState(newTheme);
  }, []);

  // Apply theme changes
  useEffect(() => {
    const applyTheme = () => {
      let shouldBeDark = false;

      if (theme === "dark") {
        shouldBeDark = true;
      } else if (theme === "light") {
        shouldBeDark = false;
      } else {
        shouldBeDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
      }

      setIsDark(shouldBeDark);

      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      localStorage.setItem("theme", theme);
    };

    applyTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, isDark }),
    [theme, setTheme, isDark],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
