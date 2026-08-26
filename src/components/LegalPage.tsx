import type { ReactNode } from "react";
import LegalHeader from "@/components/LegalHeader";
import SiteFooter from "@/components/SiteFooter";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#11110f] sm:text-[18px]">{title}</h2>
      {children}
    </section>
  );
}

export function LegalNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-[rgba(80,90,70,0.20)] bg-[#F1F2EA] px-5 py-5 text-[15px] font-medium leading-[1.7] tracking-[-0.01em] text-[#2b2a28]/88 sm:px-6 sm:py-6 sm:text-[16px] sm:leading-[1.75]">
      {children}
    </div>
  );
}

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <LegalHeader />
      <main className="min-h-screen overflow-x-clip bg-[#f7f4ee] text-[#2b2a28]">
        <article className="mx-auto w-full max-w-[60em] px-6 pb-24 pt-16 text-left sm:px-8 sm:pb-32 sm:pt-20">
          <p className="text-[20px] font-semibold tracking-[-0.02em] text-[#11110f] sm:text-[24px]">Hiros</p>
          <h1 className="mt-3 text-[28px] font-medium uppercase leading-[1.15] tracking-[0em] text-[#11110f] sm:text-[36px]">
            {title}
          </h1>
          {lastUpdated ? (
            <p className="mt-4 text-[14px] font-medium text-[#11110f]/55">Last updated: {lastUpdated}</p>
          ) : null}
          <div className="mt-5 space-y-5 text-[15px] font-medium leading-[1.7] tracking-[-0.01em] text-[#2b2a28]/88 sm:text-[16px] sm:leading-[1.75]">
            {children}
          </div>
        </article>
        <SiteFooter />
      </main>
    </>
  );
}

export const legalLinkClassName = "underline underline-offset-[3px]";
export const legalListClassName = "list-disc space-y-3 pl-5";
