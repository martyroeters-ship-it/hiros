import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/BlogArticle";
import BlogArticleHeader from "@/components/BlogArticleHeader";
import FloatingChat from "@/components/FloatingChat";
import SiteFooter from "@/components/SiteFooter";
import { blogArticles } from "@/data/blogArticles";
import { blogPostSlugs } from "@/data/blogPostSlugs";
import { getBlogPost } from "@/data/blogPosts";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPostSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "Daha net cevaplar | Hiros" };
  }

  const tr = post.copy.tr;

  return {
    title: `${tr.title} | Hiros`,
    description: tr.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: tr.title,
      description: tr.excerpt,
      locale: "tr_TR",
      alternateLocale: ["en_US"],
      type: "article",
      siteName: "Hiros",
      url: `/blog/${slug}`,
      images: [
        {
          url: "/og-image.png",
          width: 400,
          height: 400,
          alt: "Hiros",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: tr.title,
      description: tr.excerpt,
      images: ["/og-image.png"],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const articleMeta = blogArticles.find((article) => article.slug === post.slug);

  return (
    <>
      <BlogArticleHeader post={post} topic={articleMeta?.topic} />
      <main className="min-h-screen overflow-x-clip bg-white text-[#11110f]">
        <BlogArticle post={post} />
        <SiteFooter />
        <FloatingChat />
      </main>
    </>
  );
}
