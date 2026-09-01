"use client";

import Link from "next/link";
import { ArticleGrid, BLOG_COLUMN_CLASS, TopicPills, topicHref, useBlogTopic } from "@/components/BlogIndex";
import type { BlogArticle } from "@/data/blogArticles";

type BlogArchiveProps = {
  section: BlogArticle["section"];
  title: string;
  crumb: string;
  basePath: "/blog/all" | "/blog/guides";
};

export default function BlogAllArticles({ section, title, crumb, basePath }: BlogArchiveProps) {
  const { topic, filtered } = useBlogTopic();
  const articles = filtered.filter((article) => article.section === section);
  const blogHref = topicHref("/blog", topic);

  return (
    <div className="relative isolate">
      <div className="bg-white pt-12 sm:pt-16">
        <div className={`${BLOG_COLUMN_CLASS} pb-8 sm:pb-10`}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#11110f]/40">
            <Link href="/" className="transition-colors hover:text-[#11110f]/70">
              Home
            </Link>
            {" / "}
            <Link href={blogHref} className="transition-colors hover:text-[#11110f]/70">
              Blog
            </Link>
            {" / "}
            <span>{crumb}</span>
          </p>
          <h1 className="mt-4 font-title text-[48px] font-normal leading-[1.02] tracking-[-0.06em] text-[#11110f] sm:text-[64px] lg:text-[80px] lg:tracking-[-0.08em]">
            {title}
          </h1>
          <TopicPills topic={topic} basePath={basePath} />
        </div>
      </div>

      <div className="relative z-10 bg-[#f7f7f7]">
        <section className="relative rounded-b-[20px] bg-white pb-16 pt-4 sm:pb-24 sm:pt-5">
          <div className={BLOG_COLUMN_CLASS}>
            <ArticleGrid articles={articles} />
          </div>
        </section>
      </div>
    </div>
  );
}
