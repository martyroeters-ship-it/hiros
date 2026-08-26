"use client";

import Image from "next/image";
import Link from "next/link";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";
import { useHomeCopy } from "@/i18n/LanguageProvider";

export default function LegalHeader() {
  const { copy } = useHomeCopy();

  return (
    <header className="sticky left-0 top-0 z-50 w-full shrink-0 border-b border-black/10 bg-white">
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
          <button
            type="button"
            aria-label={copy.nav.menu}
            className="flex items-center justify-center self-center p-0 text-[#11110f]"
          >
            <span className="flex w-[16px] flex-col gap-[3px]">
              <span className="block h-[1.5px] w-full rounded-full bg-current" />
              <span className="block h-[1.5px] w-full rounded-full bg-current" />
              <span className="block h-[1.5px] w-full rounded-full bg-current" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
