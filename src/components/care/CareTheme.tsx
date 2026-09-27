"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CareTheme = "light" | "dark";

const STORAGE_KEY = "hiros-care-theme";

function readStoredTheme(): CareTheme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

function applyDocumentTheme(theme: CareTheme) {
  document.documentElement.setAttribute("data-care-theme", theme);
}

type CareThemeContextValue = {
  theme: CareTheme;
  setTheme: (theme: CareTheme) => void;
  toggleTheme: () => void;
};

const CareThemeContext = createContext<CareThemeContextValue | null>(null);

export function CareThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<CareTheme>("dark");

  useEffect(() => {
    const next = readStoredTheme();
    setThemeState(next);
    applyDocumentTheme(next);
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      window.localStorage.setItem(STORAGE_KEY, "dark");
    }
    return () => {
      document.documentElement.removeAttribute("data-care-theme");
    };
  }, []);

  const setTheme = useCallback((next: CareTheme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    applyDocumentTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      applyDocumentTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <CareThemeContext.Provider value={value}>{children}</CareThemeContext.Provider>;
}

export function useCareTheme() {
  const context = useContext(CareThemeContext);
  if (!context) {
    throw new Error("useCareTheme must be used within CareThemeProvider");
  }
  return context;
}

export function CareThemeToggle({
  label = "Dark theme",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const { theme, toggleTheme } = useCareTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      onClick={toggleTheme}
      className={`flex items-center gap-3 ${className}`}
    >
      <span className="text-[13px] font-semibold text-inherit">{label}</span>
      <span
        className={`relative h-[28px] w-[50px] shrink-0 rounded-full transition-colors duration-200 ${
          isDark ? "bg-[#9aaf8c]" : "bg-[#d4d0c8]"
        }`}
      >
        <span
          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-all duration-200 ${
            isDark ? "left-[25px]" : "left-[3px]"
          }`}
        />
      </span>
    </button>
  );
}

export function CareThemeIconButton() {
  const { theme, toggleTheme } = useCareTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--care-hairline)] bg-[var(--care-surface)] text-[var(--care-ink)]"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 3v1.5M12 19.5V21M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3 12h1.5M19.5 12H21M4.9 19.1 6 18M18 6l1.1-1.1"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
          <path d="M13.2 4.4a8.2 8.2 0 1 0 6.4 11.6A7.1 7.1 0 0 1 13.2 4.4Z" />
        </svg>
      )}
    </button>
  );
}
