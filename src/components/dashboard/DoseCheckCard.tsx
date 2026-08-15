"use client";

import { useState } from "react";

type Props = { cardClassName: string; titleClassName: string };

export function DoseCheckCard({ cardClassName, titleClassName }: Props) {
  const [logged, setLogged] = useState<"taken" | "missed" | null>(null);

  return (
    <div className={`flex min-h-0 min-w-0 flex-col ${cardClassName}`}>
      <p className={titleClassName}>Today's dose</p>
      <p className="text-[11px] text-[#8a9288]">Finasteride 0.25%</p>

      {logged === null ? (
        <div className="mt-1 flex flex-1 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLogged("taken")}
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#dde8d6] py-1.5 text-[11px] font-semibold text-[#3d5c35] transition-colors hover:bg-[#cddec5]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.5">
              <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Taken
          </button>
          <button
            type="button"
            onClick={() => setLogged("missed")}
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#f5ddd8] py-1.5 text-[11px] font-semibold text-[#a85f3f] transition-colors hover:bg-[#f0cfc8]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
            Skipped
          </button>
        </div>
      ) : logged === "taken" ? (
        <div className="mt-1 flex flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4a6b42]">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="white" strokeWidth="2.5">
              <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold text-[#3d4540]">Logged</p>
        </div>
      ) : (
        <div className="mt-1 flex flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3ddd0]">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="#a85f3f" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold text-[#3d4540]">Skipped</p>
        </div>
      )}
    </div>
  );
}
