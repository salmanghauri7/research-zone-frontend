"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeOption = "light" | "dark" | "system";

interface ThemeContextType {
    theme: ThemeOption;
    setTheme: (theme: ThemeOption) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeOption>("light");
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Load theme from localStorage on mount
        const savedTheme = localStorage.getItem("theme") as ThemeOption | null;
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Default to system preference
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setTheme(systemPrefersDark ? "dark" : "light");
        }
    }, []);

    useEffect(() => {
        const applyTheme = () => {
            let shouldBeDark = false;

            if (theme === "dark") {
                shouldBeDark = true;
            } else if (theme === "light") {
                shouldBeDark = false;
            } else {
                // system
                shouldBeDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            }

            setIsDark(shouldBeDark);

            if (shouldBeDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }

            // Save to localStorage
            localStorage.setItem("theme", theme);
        };

        applyTheme();

        // Listen for system theme changes if using system theme
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = () => applyTheme();
            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        }
    }, [theme]);

    return (
        <ThemeContext value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext>
    );
}

export function useTheme() {

        const context = useContext(ThemeContext);
        if (context === undefined) {
            throw new Error("useTheme must be used within a ThemeProvider");
        }
        return context;
    }
