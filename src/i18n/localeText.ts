import type { Locale } from "@/i18n/homeCopy";

export type LocalizedText = { tr: string; en: string };

export function loc(text: LocalizedText, locale: Locale) {
  return text[locale] ?? text.tr;
}
