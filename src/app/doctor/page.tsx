"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NowItem, NowKind } from "@/lib/now-repo";
import { formatDoctorRelativeTime } from "./copy";
import { localizeDoctorText } from "./localize";
import { DoctorChrome } from "./shell";
import { subscribeStoredCases } from "./store";
import { useDoctorLanguage } from "./use-doctor-language";

const kindTone: Record<NowKind, string> = {
  new_case: "bg-[#eef3fb] text-[#3b6fe0]",
  visit_request: "bg-[#fff8ee] text-[#9a4e07]",
  call_today: "bg-[#eaf5ec] text-[#3f5f35]",
  unread_message: "bg-[#f4f5f3] text-[#2b2a28]",
};

export default function DoctorNowPage() {
  const { copy, language } = useDoctorLanguage();
  const [items, setItems] = useState<NowItem[] | null>(null);
  const kindLabel: Record<NowKind, string> = {
    new_case: copy.now.newCase,
    visit_request: copy.now.visitRequest,
    call_today: copy.now.callToday,
    unread_message: copy.now.unreadMessage,
  };

  useEffect(() => {
    const load = () => {
      void fetch("/api/doctor/now", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) throw new Error("failed");
          setItems((await res.json()) as NowItem[]);
        })
        .catch(() => setItems((current) => current ?? []));
    };
    load();
    return subscribeStoredCases(load);
  }, []);

  return (
    <DoctorChrome active="now" title={copy.pages.now}>
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
        {items === null ? (
          <p className="text-[14px] text-black/40">{copy.now.loading}</p>
        ) : items.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-black/10 bg-white px-6 py-14 text-center text-[14px] font-medium text-black/40">
            {copy.now.empty}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col gap-2 rounded-[16px] border border-black/[0.06] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${kindTone[item.kind]}`}>{kindLabel[item.kind]}</span>
                      <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#1f241b]">{item.title}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[13.5px] text-black/55">{localizeDoctorText(language, item.detail)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[12.5px] font-medium text-black/40">
                    <span>{formatDoctorRelativeTime(copy, item.when)}</span>
                    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] text-black/30 transition group-hover:translate-x-0.5" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </DoctorChrome>
  );
}
