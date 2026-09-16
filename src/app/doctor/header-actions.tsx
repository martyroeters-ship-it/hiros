"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { displayName, useSessionUser } from "@/lib/use-session-user";
import { useDoctorLanguage } from "./use-doctor-language";

export function DoctorHeaderActions() {
  const { language, copy, setLanguage } = useDoctorLanguage();
  const user = useSessionUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const name = displayName(user) || user?.email || copy.header.account;

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <div className="flex rounded-full border border-black/10 bg-white p-0.5">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            language === "en" ? "bg-[#2f5f4f] text-white" : "text-[#2b2a28] hover:bg-black/[0.04]"
          }`}
        >
          {copy.header.languageEn}
        </button>
        <button
          type="button"
          onClick={() => setLanguage("tr")}
          className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            language === "tr" ? "bg-[#2f5f4f] text-white" : "text-[#2b2a28] hover:bg-black/[0.04]"
          }`}
        >
          {copy.header.languageTr}
        </button>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-label={copy.header.account}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#2f5f4f] hover:bg-black/[0.03]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
            <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
            <path d="M5 19c.8-3.2 3.6-5 7-5s6.2 1.8 7 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
        {open ? (
          <div className="absolute right-0 top-full z-40 mt-2 w-[220px] overflow-hidden rounded-[14px] border border-black/10 bg-white py-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
            <div className="border-b border-black/[0.06] px-3.5 py-2.5">
              <p className="text-[11px] font-medium text-black/40">{copy.header.signedInAs}</p>
              <p className="truncate text-[13px] font-semibold text-[#1f241b]">{name}</p>
              {user?.email ? <p className="truncate text-[12px] text-black/45">{user.email}</p> : null}
            </div>
            <Link
              href="/doctor/settings"
              onClick={() => setOpen(false)}
              className="flex w-full px-3.5 py-2.5 text-left text-[13px] font-medium text-[#1f241b] hover:bg-[#f7f6f3]"
            >
              {copy.header.settings}
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void fetch("/api/auth/logout", { method: "POST" }).then(() => {
                  window.location.href = "/doctor";
                });
              }}
              className="flex w-full px-3.5 py-2.5 text-left text-[13px] font-medium text-[#a81d12] hover:bg-[#f7f6f3]"
            >
              {copy.header.logout}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
