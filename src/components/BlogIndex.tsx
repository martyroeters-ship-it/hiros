"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { blogArticles, blogTopics, type BlogArticle } from "@/data/blogArticles";
import { hasBlogPost } from "@/data/blogPostSlugs";

export const BLOG_COLUMN_CLASS = "mx-auto w-[min(1080px,83.076923%,calc(100%-3rem))]";
export const HOME_SECTION_COUNT = 6;

type BlogArchivePath = "/blog/all" | "/blog/guides";
type TopicPillsPath = "/blog" | BlogArchivePath;

export function topicHref(basePath: TopicPillsPath, topic: string) {
  return topic === "all" ? basePath : `${basePath}?topic=${topic}`;
}

function articleHref(article: BlogArticle) {
  return hasBlogPost(article.slug) ? `/blog/${article.slug}` : undefined;
}

export function articlesForTopic(topic: string) {
  if (topic === "all") return blogArticles;
  return blogArticles.filter((article) => article.topic === topic);
}

export function resolvedTopic(topicFromUrl: string | null) {
  if (topicFromUrl && blogTopics.some((item) => item.slug === topicFromUrl)) {
    return topicFromUrl;
  }
  return "all";
}

function ArticleShell({
  article,
  className,
  children,
  label,
}: {
  article: BlogArticle;
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  const href = articleHref(article);

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {children}
      </Link>
    );
  }

  return <article className={className}>{children}</article>;
}

function ArticleByline({ article }: { article: BlogArticle }) {
  return (
    <p className="mt-1.5 text-[13px] font-medium text-[#11110f]/45">
      <span className="text-[#11110f]/70">{article.author}</span>
      {` in ${article.category}`}
    </p>
  );
}

function ArticleTags({ article }: { article: BlogArticle }) {
  const tags = [...new Set([article.tag, article.category].filter(Boolean))] as string[];

  if (tags.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="w-fit rounded-full bg-[#f0eee8] px-3 py-1 text-[12px] font-medium text-[#11110f]/70">
          {tag}
        </span>
      ))}
    </div>
  );
}

function FeaturedPrimary({ article }: { article: BlogArticle }) {
  return (
    <>
      <ArticleShell
        article={article}
        label={article.title}
        className="group relative order-1 block aspect-[16/10] overflow-hidden rounded-[20px] bg-[#eeeae2] lg:col-start-1 lg:row-start-1"
      >
        <Image src={article.image} alt="" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 70vw" />
      </ArticleShell>
      <ArticleShell article={article} className="group order-2 mt-5 lg:col-start-1 lg:row-start-2 lg:mt-6">
        <h2 className="text-[32px] font-medium leading-[1.05] tracking-[-0.04em] text-[#11110f] underline-offset-[6px] transition-colors group-hover:underline sm:text-[40px] lg:text-[44px] lg:tracking-[-0.05em]">
          {article.title}
        </h2>
        <ArticleByline article={article} />
        <p className="mt-2 max-w-2xl text-[15px] font-medium leading-[1.5] text-[#11110f]/65 sm:text-[16px]">{article.excerpt}</p>
        <ArticleTags article={article} />
      </ArticleShell>
    </>
  );
}

function FeaturedSecondary({ article }: { article: BlogArticle }) {
  return (
    <ArticleShell article={article} className="group flex items-start gap-4 sm:gap-5">
      <div className="min-w-0 flex-1">
        <h3 className="text-[20px] font-medium leading-[1.1] tracking-[-0.03em] text-[#11110f] underline-offset-[5px] transition-colors group-hover:underline sm:text-[22px]">
          {article.title}
        </h3>
        <ArticleByline article={article} />
        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-[1.45] text-[#11110f]/65">{article.excerpt}</p>
        <ArticleTags article={article} />
      </div>
      <div className="relative size-[104px] shrink-0 overflow-hidden rounded-[20px] bg-[#eeeae2] sm:size-[128px]">
        <Image src={article.image} alt="" fill className="object-cover" sizes="128px" />
      </div>
    </ArticleShell>
  );
}

function FeaturedTrio({ articles }: { articles: BlogArticle[] }) {
  const [primary, ...rest] = articles;

  if (!primary) return null;

  return (
    <div
      className={
        rest.length > 0
          ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:items-stretch lg:gap-x-10"
          : "grid grid-cols-1"
      }
    >
      <FeaturedPrimary article={primary} />
      {rest.length > 0 ? (
        <div className="order-3 mt-10 flex flex-col gap-6 lg:col-start-2 lg:row-start-1 lg:mt-0">
          {rest.map((article) => (
            <FeaturedSecondary key={article.slug} article={article} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <ArticleShell article={article} className="group flex flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-[20px] bg-[#eeeae2]">
        <Image src={article.image} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px" />
      </div>
      <h3 className="mt-4 text-[28px] font-medium leading-[1em] tracking-[-0.03em] text-[#11110f] underline-offset-[5px] transition-colors group-hover:underline">
        {article.title}
      </h3>
      <ArticleByline article={article} />
      <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-[1.5] text-[#11110f]/65">{article.excerpt}</p>
      <ArticleTags article={article} />
    </ArticleShell>
  );
}

export function ArticleGrid({ articles }: { articles: BlogArticle[] }) {
  if (articles.length === 0) {
    return <p className="text-[15px] font-medium text-[#11110f]/55">No articles in this topic yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </div>
  );
}

function SectionDivider() {
  return <div aria-hidden="true" className="h-[15px] bg-[#f7f7f7]" />;
}

function SeeAllLink({ href }: { href: string }) {
  return (
    <div className="mt-12 flex justify-center sm:mt-16">
      <Link
        href={href}
        className="rounded-full bg-[#f0eee8] px-6 py-3.5 text-[14px] font-medium text-[#11110f] transition-colors hover:bg-[#e7e4dc]"
      >
        See all articles
      </Link>
    </div>
  );
}

export function TopicPills({
  topic,
  basePath,
}: {
  topic: string;
  basePath: TopicPillsPath;
}) {
  const router = useRouter();

  return (
    <div className="-mx-6 mt-8 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 lg:flex-nowrap">
      {blogTopics.map((item) => {
        const isActive = item.slug === topic;
        const href = topicHref(basePath, item.slug);

        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => {
              router.replace(href, { scroll: false });
            }}
            className={`shrink-0 whitespace-nowrap rounded-full px-5 py-3.5 text-[14px] font-medium transition-colors lg:flex-1 lg:px-6 ${
              isActive ? "bg-[#11110f] text-white" : "bg-[#f0eee8] text-[#11110f] hover:bg-[#e7e4dc]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function useBlogTopic() {
  const searchParams = useSearchParams();
  const topicFromUrl = searchParams.get("topic");
  const [topic, setTopic] = useState(() => resolvedTopic(topicFromUrl));

  useEffect(() => {
    setTopic(resolvedTopic(topicFromUrl));
  }, [topicFromUrl]);

  const filtered = useMemo(() => articlesForTopic(topic), [topic]);

  return { topic, filtered };
}

export default function BlogIndex() {
  const { topic, filtered } = useBlogTopic();
  const featured = filtered.slice(0, 3);
  const remaining = filtered.slice(3);
  const latest = remaining.filter((article) => article.section === "latest");
  const guides = remaining.filter((article) => article.section === "guides");
  const latestPreview = latest.slice(0, HOME_SECTION_COUNT);
  const guidesPreview = guides.slice(0, HOME_SECTION_COUNT);
  const hasLatest = latestPreview.length > 0;
  const hasGuides = guidesPreview.length > 0;

  const sectionClass = (opts: { top?: boolean; bottom?: boolean; extra?: string }) =>
    `relative bg-white ${opts.top ? "rounded-t-[20px] pt-12 sm:pt-16" : "pt-4 sm:pt-5"} ${
      opts.bottom ? "rounded-b-[20px] pb-16 sm:pb-20" : "pb-24 sm:pb-32"
    } ${opts.extra ?? ""}`;

  return (
    <div className="relative isolate">
      <div className="sticky top-[52px] z-0 bg-white pt-12 sm:top-[56px] sm:pt-16">
        <div className={`${BLOG_COLUMN_CLASS} pb-8 sm:pb-10`}>
          <h1 className="font-title text-[48px] font-normal leading-[1.02] tracking-[-0.06em] text-[#11110f] sm:text-[64px] lg:text-[80px] lg:tracking-[-0.08em]">
            Clearer answers
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] font-medium leading-[1.5] text-[#11110f] sm:text-[18px]">
            Notes on hair loss, private care, and how the process works—from Hiros.
          </p>
          <TopicPills topic={topic} basePath="/blog" />
        </div>
      </div>

      <div className="relative z-10 bg-[#f7f7f7]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 -translate-y-full bg-gradient-to-b from-transparent to-white backdrop-blur-[12px] [mask-image:linear-gradient(to_bottom,transparent,black)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black)]"
        />

        {featured.length > 0 ? (
          <section className={sectionClass({ bottom: hasLatest || hasGuides, extra: hasLatest || hasGuides ? "rounded-t-none" : "" })}>
            <div className={BLOG_COLUMN_CLASS}>
              <FeaturedTrio articles={featured} />
            </div>
          </section>
        ) : (
          <section className="relative bg-white pb-24 pt-4 sm:pb-32 sm:pt-5">
            <div className={BLOG_COLUMN_CLASS}>
              <p className="text-[15px] font-medium text-[#11110f]/55">No articles in this topic yet.</p>
            </div>
          </section>
        )}

        {featured.length > 0 && hasLatest ? <SectionDivider /> : null}

        {hasLatest ? (
          <section className={sectionClass({ top: featured.length > 0, bottom: hasGuides })}>
            <div className={BLOG_COLUMN_CLASS}>
              <h2 className="mb-8 overflow-visible pt-[0.12em] font-title text-[36px] font-normal leading-[1.15] tracking-[-0.04em] text-[#11110f] sm:mb-10 sm:text-[48px] lg:text-[60px] lg:tracking-[-0.07em]">
                Latest
              </h2>
              <ArticleGrid articles={latestPreview} />
              <SeeAllLink href={topicHref("/blog/all", topic)} />
            </div>
          </section>
        ) : null}

        {hasLatest && hasGuides ? <SectionDivider /> : null}

        {hasGuides ? (
          <section className={sectionClass({ top: featured.length > 0 || hasLatest, extra: "rounded-b-none" })}>
            <div className={BLOG_COLUMN_CLASS}>
              <h2 className="mb-8 overflow-visible pt-[0.12em] font-title text-[36px] font-normal leading-[1.15] tracking-[-0.04em] text-[#11110f] sm:mb-10 sm:text-[48px] lg:text-[60px] lg:tracking-[-0.07em]">
                Lifestyle guides
              </h2>
              <ArticleGrid articles={guidesPreview} />
              <SeeAllLink href={topicHref("/blog/guides", topic)} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
