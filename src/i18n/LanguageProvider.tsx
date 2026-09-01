"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { homeCopy, type Locale } from "./homeCopy";
import { intakeCopy } from "./intakeCopy";

const STORAGE_KEY = "hiros-locale";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: (typeof homeCopy)[Locale];
  intake: (typeof intakeCopy)[Locale];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "tr") {
      setLocaleState(stored);
    }
    setHasLoadedPreference(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedPreference) {
      return;
    }

    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [hasLoadedPreference, locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      copy: homeCopy[locale],
      intake: intakeCopy[locale],
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useHomeCopy() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useHomeCopy must be used within LanguageProvider");
  }

  return context;
}

export function useHydratedLocale(): Locale {
  const { locale } = useHomeCopy();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated ? locale : "tr";
}

export function useIntakeCopy() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useIntakeCopy must be used within LanguageProvider");
  }

  return context.intake;
}
