import type { Metadata } from "next";
import { Suspense } from "react";
import BlogAllArticles from "@/components/BlogAllArticles";
import FloatingChat from "@/components/FloatingChat";
import LegalHeader from "@/components/LegalHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "All articles | Hiros",
  description: "Browse every Hiros note on hair loss, private care, and how the process works.",
};

export default function BlogAllPage() {
  return (
    <>
      <LegalHeader elevateOnScroll />
      <main className="min-h-screen overflow-x-clip bg-white text-[#11110f]">
        <Suspense>
          <BlogAllArticles section="latest" title="All articles" crumb="All" basePath="/blog/all" />
        </Suspense>
        <div className="relative z-20">
          <SiteFooter />
        </div>
        <FloatingChat />
      </main>
    </>
  );
}
