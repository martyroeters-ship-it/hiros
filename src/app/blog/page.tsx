import type { Metadata } from "next";
import { Suspense } from "react";
import BlogIndex from "@/components/BlogIndex";
import FloatingChat from "@/components/FloatingChat";
import LegalHeader from "@/components/LegalHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Clearer answers | Hiros",
  description: "Notes on hair loss, private care, and how the process works—from Hiros.",
};

export default function BlogPage() {
  return (
    <>
      <LegalHeader elevateOnScroll />
      <main className="min-h-screen overflow-x-clip bg-white text-[#11110f]">
        <Suspense>
          <BlogIndex />
        </Suspense>
        <div className="relative z-20">
          <SiteFooter />
        </div>
        <FloatingChat />
      </main>
    </>
  );
}
