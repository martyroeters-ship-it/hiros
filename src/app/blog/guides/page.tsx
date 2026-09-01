import type { Metadata } from "next";
import { Suspense } from "react";
import BlogAllArticles from "@/components/BlogAllArticles";
import FloatingChat from "@/components/FloatingChat";
import LegalHeader from "@/components/LegalHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Lifestyle guides | Hiros",
  description: "Browse Hiros lifestyle guides on hair loss, private care, and staying with the process.",
};

export default function BlogGuidesPage() {
  return (
    <>
      <LegalHeader elevateOnScroll />
      <main className="min-h-screen overflow-x-clip bg-white text-[#11110f]">
        <Suspense>
          <BlogAllArticles section="guides" title="Lifestyle guides" crumb="Guides" basePath="/blog/guides" />
        </Suspense>
        <div className="relative z-20">
          <SiteFooter />
        </div>
        <FloatingChat />
      </main>
    </>
  );
}
