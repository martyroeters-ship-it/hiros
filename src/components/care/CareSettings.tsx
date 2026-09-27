"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardSettings from "@/app/dashboard/(shell)/settings/page";
import { CareThemeToggle } from "@/components/care/CareTheme";

export default function CareSettings() {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [resetNote, setResetNote] = useState("");

  const resetCheckIns = async () => {
    if (resetting) return;
    setResetting(true);
    setResetNote("");
    try {
      const res = await fetch("/api/care/lifestyle", { method: "DELETE" });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Could not reset check-ins");
      setResetNote("Cleared. Nutrition and Sleep are ready to answer again.");
      router.push("/care");
      router.refresh();
    } catch (error) {
      setResetNote(error instanceof Error ? error.message : "Could not reset check-ins");
      setResetting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardSettings />

      <div>
        <p className="mb-1.5 ml-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--care-faint)]">Account</p>
        <div className="overflow-hidden rounded-[16px] bg-[var(--care-surface)] shadow-[var(--care-card-shadow)]">
          <Link
            href="/care/settings/profile"
            className="flex w-full items-center justify-between px-4 py-3.5 text-left"
          >
            <span className="text-[14px] font-medium text-[var(--care-ink)]">Profile</span>
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-[var(--care-faint)]" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      <div>
        <p className="mb-1.5 ml-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--care-faint)]">Appearance</p>
        <div className="overflow-hidden rounded-[16px] bg-[var(--care-surface)] shadow-[var(--care-card-shadow)]">
          <div className="px-4 py-3">
            <CareThemeToggle className="w-full justify-between text-[var(--care-ink)]" />
          </div>
        </div>
        <p className="mt-2 ml-1 text-[12px] leading-relaxed text-[var(--care-faint)]">
          Dark theme uses a teal sage canvas with white type and glass panels on every Care tab. Light keeps the cream view.
        </p>
      </div>

      <div>
        <p className="mb-1.5 ml-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--care-faint)]">Hair health</p>
        <div className="overflow-hidden rounded-[16px] bg-[var(--care-surface)] shadow-[var(--care-card-shadow)]">
          <button
            type="button"
            onClick={() => void resetCheckIns()}
            disabled={resetting}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left disabled:opacity-50"
          >
            <span className="text-[14px] font-medium text-[var(--care-ink)]">Reset Nutrition and Sleep check-ins</span>
            <span className="text-[13px] font-semibold text-[var(--care-accent)]">
              {resetting ? "Clearing…" : "Reset"}
            </span>
          </button>
        </div>
        <p className="mt-2 ml-1 text-[12px] leading-relaxed text-[var(--care-faint)]">
          {resetNote || "Clears your answers so the questions show up again on Insights."}
        </p>
      </div>
    </div>
  );
}
