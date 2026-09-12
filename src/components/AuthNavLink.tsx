"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useHomeCopy } from "@/i18n/LanguageProvider";
import { displayName, useSessionUser } from "@/lib/use-session-user";
import { useLoginDrawer } from "@/components/LoginDrawer";

export function AuthNavLink({ className, style }: { className?: string; style?: CSSProperties }) {
  const { copy } = useHomeCopy();
  const user = useSessionUser();
  const loginDrawer = useLoginDrawer();

  if (user) {
    return (
      <Link href="/dashboard" style={style} className={className}>
        {displayName(user) || copy.nav.account}
      </Link>
    );
  }

  return (
    <button
      type="button"
      style={style}
      className={`cursor-pointer ${className ?? ""}`}
      onClick={() => loginDrawer?.openLogin()}
    >
      {copy.nav.login}
    </button>
  );
}
