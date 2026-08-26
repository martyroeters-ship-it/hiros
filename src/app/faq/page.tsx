import type { Metadata } from "next";
import FaqHub from "@/components/FaqHub";
import FloatingChat from "@/components/FloatingChat";
import LegalHeader from "@/components/LegalHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "FAQs | Hiros",
  description: "Find answers about Hiros, your account and how the process works.",
};

export default function FaqPage() {
  return (
    <>
      <LegalHeader />
      <main className="min-h-screen overflow-x-clip bg-[#fbfaf5] text-[#11110f]">
        <FaqHub />
        <SiteFooter />
        <FloatingChat />
      </main>
    </>
  );
}
