"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = "investpro-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "dark";
  }
}

function applyThemeToDocument(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
        setThemeState(savedTheme);
        const resolved = savedTheme === "system" ? getSystemTheme() : savedTheme;
        setResolvedTheme(resolved);
        applyThemeToDocument(resolved);
      } else {
        setThemeState("system");
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyThemeToDocument(resolved);
      }
    } catch {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyThemeToDocument(resolved);
    }
    setMounted(true);
  }, []);

  // Listen to phone/device system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (!savedTheme || savedTheme === "system") {
          const newResolved: ResolvedTheme = e.matches ? "dark" : "light";
          setResolvedTheme(newResolved);
          applyThemeToDocument(newResolved);
        }
      } catch {}
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleMediaChange);
      return () => (mediaQuery as any).removeListener(handleMediaChange);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
    applyThemeToDocument(resolved);
    setThemeState(newTheme);
    setResolvedTheme(resolved);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme in localStorage:", e);
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
