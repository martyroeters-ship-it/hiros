"use client";

import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";
import { footerLinkHref } from "@/i18n/homeCopy";
import { useHomeCopy } from "@/i18n/LanguageProvider";

export default function SiteFooter() {
  const { copy } = useHomeCopy();

  return (
    <footer className={`relative z-10 -mt-[34px] rounded-t-[34px] bg-black pb-10 pt-12 text-white sm:pt-16 ${HOME_PAGE_GUTTER_CLASS}`}>
      <div className="grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-[1.1fr_2fr] md:gap-16">
        <div className="flex flex-col justify-start gap-6 self-stretch md:h-full md:justify-end">
          <div
            role="img"
            aria-label="Hiros"
            style={{
              WebkitMaskImage: "url('/hiros_logo.png')",
              maskImage: "url('/hiros_logo.png')",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "left center",
              maskPosition: "left center",
            }}
            className="h-10 w-28 bg-gradient-to-r from-[#3f5f35] via-[#6f8759] to-[#7f906d] sm:h-[72px] sm:w-44"
          />
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2a2a2a] sm:h-12 sm:w-12">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.5-.1-1.4-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4V11H7.5v3h2.4v7h3.6Z" />
              </svg>
            </a>
            <a href="#" aria-label="X" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2a2a2a] sm:h-12 sm:w-12">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M18.9 3H21l-6.8 7.7L22 21h-6.1l-4.8-6.3L5.6 21H3.5l7.2-8.2L3 3h6.2l4.3 5.8L18.9 3Zm-1.1 16h1.2L8.5 4.9H7.2l10.6 14.1Z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2a2a2a] sm:h-12 sm:w-12">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="TikTok" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2a2a2a] sm:h-12 sm:w-12">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M14.6 3c.2 1.8 1.2 3.4 2.8 4.3 1 .6 2.1.9 3.3.9v3.1c-1.3 0-2.6-.3-3.8-.9l-.1-.1v5.9c0 1.4-.5 2.7-1.5 3.7s-2.3 1.5-3.7 1.5-2.7-.5-3.7-1.5-1.5-2.3-1.5-3.7.5-2.7 1.5-3.7 2.3-1.5 3.7-1.5c.3 0 .7 0 1 .1v3.2c-.3-.1-.6-.2-1-.2-.6 0-1.1.2-1.5.6s-.6.9-.6 1.5.2 1.1.6 1.5.9.6 1.5.6 1.1-.2 1.5-.6.6-.9.6-1.5V3h3.4Z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3 sm:gap-14">
          {copy.footer.columns.map(([heading, ...links]) => (
            <div key={heading}>
              <h3 className="mb-4 font-semibold text-[#848484]">{heading}</h3>
              <ul className="space-y-2 text-[16px] font-bold text-white">
                {links.map((link) => {
                  const href = footerLinkHref(link);

                  return (
                    <li key={link}>
                      {href ? (
                        <a href={href} className="transition-colors hover:text-white/80">
                          {link}
                        </a>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 flex max-w-7xl flex-wrap gap-x-6 gap-y-3 text-[13px] font-medium text-white/80 sm:mt-20 sm:gap-x-8 sm:text-sm">
        {copy.footer.links.map((link) => {
          const href = footerLinkHref(link) ?? "#";

          return (
            <a key={link} href={href} className="transition-colors hover:text-white">
              {link}
            </a>
          );
        })}
      </div>
      <div className="mt-8 max-w-7xl text-center text-sm font-medium text-white/60">© Hiros 2026</div>
    </footer>
  );
}
