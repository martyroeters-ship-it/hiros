"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BLOG_ARTICLE_CHROME_OFFSET, BLOG_ARTICLE_SCROLL_MARGIN, BLOG_ASIDE_PAD, BLOG_LAYOUT_GRID } from "@/components/BlogArticleHeader";
import {
  blogArticleUi,
  getBlogPost,
  getBlogPostCopy,
  getBlogPostToc,
  getRelatedArticles,
  type BlogPost,
  type BlogPostBlock,
  type BlogPostSource,
} from "@/data/blogPosts";
import type { Locale } from "@/i18n/homeCopy";
import { useHydratedLocale } from "@/i18n/LanguageProvider";

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[(?:[^\]]+)\]\((?:[^)]+)\))/g);

  return (
    <>
      {parts.map((part, index) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) {
          return (
            <strong key={index} className="font-semibold text-[#11110f]">
              {bold[1]}
            </strong>
          );
        }

        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={index} href={link[2]} className="font-bold underline underline-offset-[3px]">
              {link[1]}
            </Link>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function Block({ block }: { block: BlogPostBlock }) {
  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-2.5 pl-5">
        {block.items.map((item) => (
          <li key={item}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "table") {
    return (
      <div className="-mx-2 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[28rem] border-collapse text-left text-[16px] leading-[1.4] text-[#11110f] sm:text-[17px]">
          <thead>
            <tr className="border-b border-[#11110f]/15">
              {block.headers.map((header) => (
                <th key={header} className="py-3 pr-5 font-bold first:pl-2 sm:first:pl-0">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.join("|")} className="border-b border-[#11110f]/10">
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`} className={`py-3 pr-5 first:pl-2 sm:first:pl-0 ${index === 0 ? "font-semibold" : "font-medium text-[#474747]"}`}>
                    <RichText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <p>
      <RichText text={block.text} />
    </p>
  );
}

function ContentsNav({
  items,
  activeId,
  onSelect,
  heading,
}: {
  items: { id: string; title: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  heading: string;
}) {
  return (
    <nav aria-label={heading}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#11110f]/40">{heading}</p>
      <ul className="mt-3 space-y-0">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  onSelect(item.id);
                }}
                className={`relative block border-l-2 py-1.5 pl-3.5 text-[13.5px] leading-[1.35] tracking-[-0.01em] transition-colors ${
                  isActive
                    ? "border-[#11110f] font-bold text-[#11110f]"
                    : "border-transparent font-medium text-[#11110f]/45 hover:text-[#11110f]/70"
                }`}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function BlogArticle({ post }: { post: BlogPost }) {
  const locale = useHydratedLocale();
  const copy = getBlogPostCopy(post, locale);
  const ui = blogArticleUi[locale];
  const toc = useMemo(() => getBlogPostToc(post, locale), [post, locale]);
  const [activeId, setActiveId] = useState(toc[0]?.id ?? "");

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headings.length === 0) return;

    let frameId = 0;

    const update = () => {
      const chrome =
        Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--blog-chrome")) || 56;
      const offset = chrome + 32;
      let current = headings[0].id;
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      const atBottom =
        scrollingElement.scrollTop + scrollingElement.clientHeight >= scrollingElement.scrollHeight - 8;

      if (atBottom) {
        current = headings[headings.length - 1].id;
      } else {
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top <= offset) {
            current = heading.id;
          } else {
            break;
          }
        }
      }

      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => setActiveId(current));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [toc]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }

  return (
    <div className="pb-24 pt-8 sm:pb-32 sm:pt-12">
      <div className={BLOG_LAYOUT_GRID}>
        <aside className="hidden lg:block">
          <div
            className={`sticky ${BLOG_ARTICLE_CHROME_OFFSET} max-h-[calc(100vh-var(--blog-chrome,56px)-32px)] overflow-y-auto ${BLOG_ASIDE_PAD} [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
          >
            <ContentsNav items={toc} activeId={activeId} onSelect={scrollToSection} heading={ui.content} />
          </div>
        </aside>

        <article id="blog-article" lang={locale} className="min-w-0 px-6 lg:px-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#11110f]/40">
            <Link href="/" className="transition-colors hover:text-[#11110f]/70">
              {ui.home}
            </Link>
            {" / "}
            <Link href="/blog" className="transition-colors hover:text-[#11110f]/70">
              {copy.breadcrumb}
            </Link>
          </p>

          <h1
            id="article-title"
            className="mt-4 font-title text-[34px] font-bold leading-[1.08] tracking-[-0.04em] text-[#11110f] sm:text-[44px] lg:text-[52px] lg:tracking-[-0.05em]"
          >
            {copy.title}
          </h1>

          <div className="mt-6 text-[13px] leading-[1.55] text-[#11110f]/50 sm:text-[14px]">
            <p>
              {ui.writtenBy} <span className="font-bold text-[#11110f]">{copy.author}</span>
            </p>
            <p>
              {ui.published} {post.published}
              {post.updated !== post.published ? ` · ${ui.updated} ${post.updated}` : null}
            </p>
          </div>

          <div className="mt-8 lg:hidden">
            <details className="rounded-[16px] bg-[#f7f4ee] px-4 py-3">
              <summary className="cursor-pointer text-[13px] font-semibold text-[#11110f]">{ui.onThisPage}</summary>
              <div className="pb-2 pt-3">
                <ContentsNav items={toc} activeId={activeId} onSelect={scrollToSection} heading={ui.content} />
              </div>
            </details>
          </div>

          <div className="mt-10 space-y-5 text-[22px] font-medium leading-[1.7] tracking-[-0.01em] text-[#474747]">
            {copy.intro.map((paragraph) => (
              <p key={paragraph}>
                <RichText text={paragraph} />
              </p>
            ))}

            {copy.sections.map((section) => (
              <section key={section.id} className={section.blocks.length > 0 ? "space-y-5" : undefined}>
                {section.level === 2 ? (
                  <h2
                    id={section.id}
                    className={`group ${BLOG_ARTICLE_SCROLL_MARGIN} pt-6 font-title text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-[#11110f] sm:text-[42px]`}
                  >
                    <span>{section.title}</span>
                    <a
                      href={`#${section.id}`}
                      className="ml-2 inline-flex align-middle text-[#11110f]/25 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label={`${ui.linkTo} ${section.title}`}
                    >
                      <LinkIcon />
                    </a>
                  </h2>
                ) : (
                  <h3
                    id={section.id}
                    className={`${BLOG_ARTICLE_SCROLL_MARGIN} pt-3 text-[20px] font-bold leading-[1.3] tracking-[-0.02em] text-[#11110f] sm:text-[24px]`}
                  >
                    {section.title}
                  </h3>
                )}
                {section.blocks.map((block, index) => (
                  <Block key={`${section.id}-${index}`} block={block} />
                ))}
              </section>
            ))}

          </div>

          <EditorialStandards
            heading={ui.editorialStandards}
            body={ui.editorialStandardsBody}
            disclaimer={ui.editorialDisclaimer}
          />

          {post.sources.length > 0 ? (
            <SourcesAccordion
              sources={post.sources}
              label={`${post.sources.length} ${ui.source}`}
            />
          ) : null}

          <RelatedArticles currentSlug={post.slug} heading={ui.relatedArticles} locale={locale} />
        </article>

        <div aria-hidden="true" className="hidden lg:block" />
      </div>
    </div>
  );
}

function EditorialStandards({
  heading,
  body,
  disclaimer,
}: {
  heading: string;
  body: string;
  disclaimer: string;
}) {
  return (
    <div className="mt-14 sm:mt-16">
      <aside className="rounded-[20px] bg-[#f7f7f7] px-5 py-5 sm:px-7 sm:py-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#11110f]">{heading}</p>
        <p className="mt-3 text-[15px] font-medium leading-[1.65] tracking-[-0.01em] text-[#474747] sm:text-[16px] sm:leading-[1.7]">
          <RichText text={body} />
        </p>
      </aside>
      <p className="mt-4 text-[13px] font-medium leading-[1.55] text-[#11110f]/45 sm:mt-5 sm:text-[14px]">
        <RichText text={disclaimer} />
      </p>
    </div>
  );
}

function SourcesAccordion({
  sources,
  label,
}: {
  sources: BlogPostSource[];
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-10 sm:mt-12">
      <button
        id="sources"
        type="button"
        aria-expanded={open}
        aria-controls="sources-list"
        onClick={() => setOpen((current) => !current)}
        className={`${BLOG_ARTICLE_SCROLL_MARGIN} flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left`}
      >
        <span className="text-[17px] font-bold tracking-[-0.02em] text-[#11110f] sm:text-[18px]">{label}</span>
        <span
          className={`select-none text-[22px] font-light leading-none text-[#11110f] transition-transform ${open ? "rotate-45" : ""}`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <ul
        id="sources-list"
        hidden={!open}
        className="space-y-2.5 border-t border-[#11110f]/15 pb-2 pt-5 text-[14px] leading-[1.55] text-[#474747] sm:text-[15px]"
      >
        {sources.map((source, index) => (
          <li key={`${source.href}-${index}`}>
            <a
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-[3px] transition-colors hover:text-[#11110f]"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedArticles({
  currentSlug,
  heading,
  locale,
}: {
  currentSlug: string;
  heading: string;
  locale: Locale;
}) {
  const related = useMemo(() => getRelatedArticles(currentSlug), [currentSlug]);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-20" aria-labelledby="related-articles">
      <h2
        id="related-articles"
        className="font-title text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-[#11110f] sm:text-[32px]"
      >
        {heading}
      </h2>
      <ul className="mt-6 border-t border-[#11110f]/10">
        {related.map((article, index) => {
          const relatedPost = getBlogPost(article.slug);
          const copy = relatedPost ? getBlogPostCopy(relatedPost, locale) : null;
          const title = copy?.headerTitle || copy?.title || article.title;
          const author = copy?.author || article.author;
          const published = relatedPost?.published;

          return (
            <li key={article.slug} className={index > 0 ? "border-t border-[#11110f]/10" : undefined}>
              <Link href={`/blog/${article.slug}`} className="group flex items-center gap-4 py-5 sm:gap-5">
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] font-bold leading-[1.25] tracking-[-0.02em] text-[#11110f] underline-offset-[5px] group-hover:underline sm:text-[20px]">
                    {title}
                  </p>
                  <p className="mt-1.5 text-[13px] font-medium text-[#11110f]/50">
                    {author}
                    {published ? ` / ${published}` : null}
                  </p>
                </div>
                <div className="relative size-[88px] shrink-0 overflow-hidden rounded-[20px] bg-[#eeeae2] sm:size-[104px]">
                  <Image src={article.image} alt="" fill className="object-cover" sizes="104px" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path
        d="M6.4 9.6 9.6 6.4M7.2 4.4l.4-.4a2.4 2.4 0 0 1 3.4 3.4l-.4.4M8.8 11.6l-.4.4a2.4 2.4 0 0 1-3.4-3.4l.4-.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
