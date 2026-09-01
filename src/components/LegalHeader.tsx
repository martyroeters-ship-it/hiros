"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";
import { useHomeCopy } from "@/i18n/LanguageProvider";
import SiteMenu from "@/components/SiteMenu";

export default function LegalHeader({ elevateOnScroll = false }: { elevateOnScroll?: boolean }) {
  const { copy } = useHomeCopy();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!elevateOnScroll) return;

    const onScroll = () => {
      const scrollTop =
        document.scrollingElement?.scrollTop ??
        document.documentElement.scrollTop ??
        window.scrollY;
      setScrolled(scrollTop > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [elevateOnScroll]);

  return (
    <header
      className="sticky left-0 top-0 z-50 w-full shrink-0 bg-white"
      style={{
        boxShadow: elevateOnScroll && scrolled ? "0 1px 8px rgba(0,0,0,0.06)" : undefined,
        borderBottom: elevateOnScroll ? "none" : "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <div className={`relative flex items-center justify-between py-3 ${HOME_PAGE_GUTTER_CLASS}`}>
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/hiros_logo.png"
            alt="Hiros"
            width={111}
            height={46}
            priority
            unoptimized
            className="h-auto w-[56px] sm:w-[68px]"
          />
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            className="rounded-full border border-[#11110f] bg-white px-4 py-2 text-[12px] font-semibold leading-none text-[#11110f]"
          >
            {copy.nav.login}
          </Link>
          <SiteMenu />
        </div>
      </div>
    </header>
  );
}
