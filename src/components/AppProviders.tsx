"use client";

import { LanguageProvider } from "@/i18n/LanguageProvider";
import { LoginDrawerProvider } from "@/components/LoginDrawer";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LoginDrawerProvider>{children}</LoginDrawerProvider>
    </LanguageProvider>
  );
}
