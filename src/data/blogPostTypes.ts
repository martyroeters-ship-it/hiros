import type { Locale } from "@/i18n/homeCopy";

export type BlogPostBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type BlogPostSection = {
  id: string;
  title: string;
  level: 2 | 3;
  inToc?: boolean;
  blocks: BlogPostBlock[];
};

export type BlogPostSource = {
  label: string;
  href: string;
};

export type BlogPostCopy = {
  title: string;
  headerTitle: string;
  breadcrumb: string;
  excerpt: string;
  author: string;
  intro: string[];
  sections: BlogPostSection[];
};

export type BlogPost = {
  slug: string;
  published: string;
  updated: string;
  sources: BlogPostSource[];
  copy: Record<Locale, BlogPostCopy>;
};
