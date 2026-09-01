"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHomeCopy } from "@/i18n/LanguageProvider";

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] text-[#b8b8b8]" aria-hidden="true">
      <path d="M9 5.5 16 12 9 18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SiteMenu({ iconClassName = "text-[#11110f]" }: { iconClassName?: string }) {
  const { copy } = useHomeCopy();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menu = copy.siteMenu;

  const panel = mounted
    ? createPortal(
        <>
          <button
            type="button"
            aria-label={menu.close}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className={`fixed inset-0 z-[70] bg-black/45 transition-opacity duration-300 ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-menu-title"
            aria-hidden={!open}
            className={`fixed inset-y-0 right-0 z-[80] flex w-[min(400px,92vw)] flex-col bg-white shadow-[-16px_0_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out sm:w-[380px] ${
              open ? "translate-x-0" : "pointer-events-none translate-x-full"
            }`}
            style={{ borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
          >
            <div className="flex items-center justify-between px-6 pb-2 pt-6">
              <p id="site-menu-title" className="text-[24px] font-bold leading-none text-black">
                {menu.title}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  aria-label={menu.account}
                  className="flex h-8 w-8 items-center justify-center text-black"
                  onClick={() => setOpen(false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.15" stroke="currentColor" strokeWidth="1.6" />
                    <path
                      d="M5.4 19.2c.85-3.05 3.35-4.7 6.6-4.7s5.75 1.65 6.6 4.7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </Link>
                <button
                  type="button"
                  aria-label={menu.close}
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center text-black"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
                    <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-8">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#757575]">{menu.exploreHeading}</p>
              <ul className="mt-4">
                {menu.explore.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-[18px] text-[20px] font-bold leading-none text-black"
                    >
                      {item.label}
                      <Chevron />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="my-5 h-px w-full bg-black/10" />

              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#757575]">{menu.supportHeading}</p>
              <ul className="mt-4 pb-2">
                {menu.support.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center py-[14px] text-[18px] font-bold leading-none text-black"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="shrink-0 px-6 pb-6 pt-3">
              <Link
                href="/intake"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-full bg-black px-6 py-4 text-[16px] font-bold text-white"
              >
                {menu.cta}
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        type="button"
        aria-label={copy.nav.menu}
        aria-expanded={open}
        aria-controls="site-menu-title"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center self-center p-0 ${iconClassName}`}
      >
        <span className="flex w-[16px] flex-col gap-[3px]">
          <span className="block h-[1.5px] w-full rounded-full bg-current" />
          <span className="block h-[1.5px] w-full rounded-full bg-current" />
          <span className="block h-[1.5px] w-full rounded-full bg-current" />
        </span>
      </button>
      {panel}
    </>
  );
}
