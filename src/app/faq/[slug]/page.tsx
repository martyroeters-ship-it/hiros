import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FaqCategoryView from "@/components/FaqCategoryView";
import FloatingChat from "@/components/FloatingChat";
import LegalHeader from "@/components/LegalHeader";
import SiteFooter from "@/components/SiteFooter";
import { faqCategories, getFaqCategory } from "@/data/faqCategories";

type FaqCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return faqCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: FaqCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getFaqCategory(slug);

  if (!category) {
    return { title: "FAQs | Hiros" };
  }

  return {
    title: `${category.title} | Hiros`,
    description: category.description,
  };
}

export default async function FaqCategoryPage({ params }: FaqCategoryPageProps) {
  const { slug } = await params;
  const category = getFaqCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <LegalHeader />
      <main className="min-h-screen overflow-x-clip bg-[#fbfaf5] text-[#11110f]">
        <FaqCategoryView category={category} />
        <SiteFooter />
        <FloatingChat />
      </main>
    </>
  );
}
