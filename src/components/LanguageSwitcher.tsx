"use client";

import { useHomeCopy, useHydratedLocale } from "@/i18n/LanguageProvider";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { copy, setLocale } = useHomeCopy();
  const locale = useHydratedLocale();

  return (
    <div
      role="group"
      aria-label={copy.language.aria}
      className={`flex items-center rounded-full border border-black/10 bg-white/65 px-1 py-1 text-[11px] font-semibold leading-none text-[#11110f] shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm ${
        compact ? "" : "shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={() => setLocale("tr")}
        aria-pressed={locale === "tr"}
        className={`rounded-full px-2 py-1 transition-colors ${
          locale === "tr" ? "bg-[#1f241b] text-white" : "text-[#1f241b]/55 hover:text-[#1f241b]"
        }`}
      >
        {copy.language.tr}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`rounded-full px-2 py-1 transition-colors ${
          locale === "en" ? "bg-[#1f241b] text-white" : "text-[#1f241b]/55 hover:text-[#1f241b]"
        }`}
      >
        {copy.language.en}
      </button>
    </div>
  );
}
