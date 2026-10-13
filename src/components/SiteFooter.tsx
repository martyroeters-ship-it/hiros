"use client";

import Image from "next/image";
import Link from "next/link";
import { footerLinkHref } from "@/i18n/homeCopy";
import { useHomeCopy } from "@/i18n/LanguageProvider";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";

export default function SiteFooter({ className = "" }: { className?: string }) {
  const { copy } = useHomeCopy();

  return (
    <footer className={`relative z-10 pb-10 pt-16 text-[#1f241b] ${className || "bg-white"}`}>
      <div className={`flex w-full flex-wrap justify-between gap-x-10 gap-y-8 text-sm ${HOME_PAGE_GUTTER_CLASS}`}>
        {copy.footer.columns.map(([heading, ...links]) => (
          <div key={heading} className="min-w-0 text-left">
            <h3 className="mb-4 font-semibold text-[#1f241b]/40">{heading}</h3>
            <ul className="space-y-2 text-[16px] font-semibold text-[#1f241b]">
              {links.map((link) => {
                const href = footerLinkHref(link);

                return (
                  <li key={link} className="whitespace-nowrap">
                    {href ? (
                      <a href={href} className="transition-colors hover:text-[#1f241b]/70">
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
        <div className="min-w-0 text-left">
          <Link href="/" className="inline-block">
            <Image
              src="/hiros_logo.png"
              alt="Hiros"
              width={111}
              height={46}
              className="h-6 w-auto sm:h-7"
            />
          </Link>
          <address className="mt-4 not-italic text-[13px] font-medium leading-[1.45] tracking-[-0.01em] text-[#1f241b]/45">
            {copy.footer.addressLines.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </address>
        </div>
      </div>
      <div className={`mt-10 w-full border-b border-[#E8E8E5] pb-5 sm:mt-16 sm:pb-6 ${HOME_PAGE_GUTTER_CLASS}`}>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[13px] font-medium text-[#1f241b]/55 sm:gap-x-8 sm:text-sm">
          {copy.footer.links.map((link) => {
            const href = footerLinkHref(link) ?? "#";

            return (
              <a key={link} href={href} className="transition-colors hover:text-[#1f241b]">
                {link}
              </a>
            );
          })}
        </div>
      </div>
      <div className={`mt-6 w-full text-center text-sm font-medium text-[#1f241b]/40 ${HOME_PAGE_GUTTER_CLASS}`}>© Hiros 2026</div>
      <p className={`mt-5 w-full text-left text-[10px] font-normal leading-[1.45] tracking-[-0.01em] text-[#1f241b]/40 sm:text-[11px] ${HOME_PAGE_GUTTER_CLASS}`}>
        {copy.footer.disclaimer}
      </p>
    </footer>
  );
}
