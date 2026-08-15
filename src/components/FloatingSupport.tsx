"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const quickActions = [
  "Treatment instructions",
  "Order status",
  "Upload photos",
  "Payment help",
  "Message care team",
];

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    setInput("");
  };

  return (
    <>
      {isOpen ? (
        <div
          id="hiros-support-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Hiros Support"
          className="fixed bottom-20 right-6 z-[70] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] border border-[#e8e8ed] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.14)]"
        >
          <div className="flex items-start justify-between border-b border-[#f0efeb] px-5 py-5">
            <div>
              <h3 className="font-title text-[22px] font-medium tracking-[-0.03em] text-[#2b2a28]">Hiros Support</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#757575]">
                Ask a question about your treatment, order, or follow-up.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close support"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f5f5f7]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-5 py-4">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8ea57a]">Quick actions</p>
            <ul className="space-y-2">
              {quickActions.map((action) => (
                <li key={action}>
                  <button
                    type="button"
                    onClick={() => setInput(action)}
                    className="w-full rounded-2xl bg-[#f5f5f7] px-4 py-3 text-left text-[14px] font-medium text-[#2b2a28] transition-colors hover:bg-[#eeedef]"
                  >
                    {action}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[#f0efeb] p-4">
            <div className="flex items-center gap-2 rounded-full border border-[#e8e8ed] bg-[#f5f5f7] px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question…"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#2b2a28] outline-none placeholder:text-[#aeaeb2]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2b2a28] text-white transition-colors hover:bg-[#1a1918] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m5 12 7-7 7 7M12 5v14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Open Hiros Support"
        aria-expanded={isOpen}
        aria-controls="hiros-support-panel"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#5f7f4f] via-[#8ea57a] to-[#4b6942] text-white shadow-[0_8px_24px_rgba(95,127,79,0.35)] transition-transform duration-300 hover:scale-105"
      >
        <Image src="/hiros_h.png" alt="" width={24} height={24} className="h-6 w-6 object-contain brightness-0 invert" />
      </button>
    </>
  );
}
