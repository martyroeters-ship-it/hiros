import type { Locale } from "@/i18n/homeCopy";
import { blogArticles } from "@/data/blogArticles";
import type { BlogPost } from "@/data/blogPostTypes";
import { damagedHairRepairPost } from "@/data/posts/damagedHairRepair";
import { dermarollerMinoxidilPost } from "@/data/posts/dermarollerMinoxidil";
import { hairlineRestorationPost } from "@/data/posts/hairlineRestoration";
import { hairRegrowthMenPost } from "@/data/posts/hairRegrowthMen";
import { howToApplyMinoxidilPost } from "@/data/posts/howToApplyMinoxidil";
import { isMinoxidilPermanentPost } from "@/data/posts/isMinoxidilPermanent";
import { keepingHairOnFinasteridePost } from "@/data/posts/keepingHairOnFinasteride";
import { lookingGoodWithHairLossPost } from "@/data/posts/lookingGoodWithHairLoss";
import { makeMinoxidilMoreEffectivePost } from "@/data/posts/makeMinoxidilMoreEffective";
import { microneedlingHairLossPost } from "@/data/posts/microneedlingHairLoss";
import { minoxidilAndPetsPost } from "@/data/posts/minoxidilAndPets";
import { minoxidilVsFinasteridePost } from "@/data/posts/minoxidilVsFinasteride";
import { oralVsTopicalFinasteridePost } from "@/data/posts/oralVsTopicalFinasteride";
import { progressPhotosPost } from "@/data/posts/progressPhotos";
import { recedingHairlineEarlySignsPost } from "@/data/posts/recedingHairlineEarlySigns";
import { stopFinasteridePost } from "@/data/posts/stopFinasteride";
import { thickerHairForMenPost } from "@/data/posts/thickerHairForMen";
import { topicalFinasteride101Post } from "@/data/posts/topicalFinasteride101";
import { topicalFinasterideResultsPost } from "@/data/posts/topicalFinasterideResults";
import { treatmentResistantHairLossPost } from "@/data/posts/treatmentResistantHairLoss";
import { waitingToStartTreatmentPost } from "@/data/posts/waitingToStartTreatment";
import { whyHairLossHappensPost } from "@/data/posts/whyHairLossHappens";

export type {
  BlogPost,
  BlogPostBlock,
  BlogPostCopy,
  BlogPostSection,
  BlogPostSource,
} from "@/data/blogPostTypes";

export const blogArticleUi = {
  tr: {
    content: "İçindekiler",
    home: "Ana sayfa",
    writtenBy: "Yazan",
    published: "Yayınlanma",
    updated: "Güncelleme",
    sources: "Kaynaklar",
    source: "Kaynak",
    relatedArticles: "İlgili yazılar",
    onThisPage: "Bu sayfada",
    share: "Paylaş",
    copied: "Kopyalandı",
    consultation: "Özel bir görüşmeyle başlayın",
    getStarted: "Başlayın",
    linkTo: "Bağlantı:",
    editorialStandards: "Editoryal standartlar",
    editorialStandardsBody:
      "Hiros yazıları, özel erkek saç dökülmesi bakımı için hazırlanır. Dayandığımız bilgiler hakemli literatürden ve birincil kaynaklardan gelir; lisanslı hekimler metni doğruluk açısından inceler. [Kaynak kullanımımız](/contact) hakkında soru için [support@hiros.com.tr](mailto:support@hiros.com.tr) adresine yazabilirsiniz.",
    editorialDisclaimer:
      "Bu sayfa yalnızca bilgi amaçlıdır; tıbbi tavsiye, tanı veya tedavi önerisi değildir. Kişisel bir karar vermeden önce lisanslı bir hekimle görüşün.",
    categoriesNav: "Kategoriler",
    categories: {
      all: "Tümü",
      "hair-loss": "Saç dökülmesi",
      treatments: "Tedaviler",
      "getting-started": "Başlarken",
      "staying-consistent": "Devamlılık",
      privacy: "Gizlilik",
      "how-hiros-works": "Hiros nasıl çalışır",
    } as Record<string, string>,
  },
  en: {
    content: "Content",
    home: "Home",
    writtenBy: "Written by",
    published: "Published",
    updated: "Updated",
    sources: "Sources",
    source: "Sources",
    relatedArticles: "Related articles",
    onThisPage: "On this page",
    share: "Share",
    copied: "Copied",
    consultation: "Get started with a private consultation",
    getStarted: "Get started",
    linkTo: "Link to",
    editorialStandards: "Editorial standards",
    editorialStandardsBody:
      "Hiros writes for men seeking private hair-loss care. We ground what we publish in peer-reviewed literature and primary sources, and licensed clinicians review each article for accuracy. Questions about our [sourcing guidelines](/contact) can go to [support@hiros.com.tr](mailto:support@hiros.com.tr).",
    editorialDisclaimer:
      "This page is for information only — not medical advice, diagnosis, or a treatment recommendation. Talk to a licensed clinician before making a personal decision.",
    categoriesNav: "Categories",
    categories: {
      all: "All",
      "hair-loss": "Hair loss",
      treatments: "Treatments",
      "getting-started": "Getting started",
      "staying-consistent": "Staying consistent",
      privacy: "Privacy",
      "how-hiros-works": "How Hiros works",
    } as Record<string, string>,
  },
};

export const blogPosts: BlogPost[] = [
  whyHairLossHappensPost,
  minoxidilVsFinasteridePost,
  waitingToStartTreatmentPost,
  oralVsTopicalFinasteridePost,
  thickerHairForMenPost,
  recedingHairlineEarlySignsPost,
  dermarollerMinoxidilPost,
  treatmentResistantHairLossPost,
  damagedHairRepairPost,
  hairRegrowthMenPost,
  microneedlingHairLossPost,
  makeMinoxidilMoreEffectivePost,
  isMinoxidilPermanentPost,
  minoxidilAndPetsPost,
  howToApplyMinoxidilPost,
  hairlineRestorationPost,
  lookingGoodWithHairLossPost,
  progressPhotosPost,
  topicalFinasteride101Post,
  topicalFinasterideResultsPost,
  stopFinasteridePost,
  keepingHairOnFinasteridePost,
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

export function getRelatedArticles(slug: string, count = 3) {
  const current = blogArticles.find((article) => article.slug === slug);
  const others = blogArticles.filter((article) => article.slug !== slug);

  const score = (article: (typeof others)[number]) => {
    const hasFullPost = Boolean(getBlogPost(article.slug));
    const sameTopic = Boolean(current && article.topic === current.topic);
    const sameCategory = Boolean(current && article.category === current.category);

    return (hasFullPost ? 4 : 0) + (sameTopic ? 2 : 0) + (sameCategory ? 1 : 0);
  };

  return [...others].sort((a, b) => score(b) - score(a)).slice(0, count);
}

export function getBlogPostCopy(post: BlogPost, locale: Locale) {
  return post.copy[locale] ?? post.copy.tr;
}

export function getBlogPostToc(post: BlogPost, locale: Locale) {
  const copy = getBlogPostCopy(post, locale);

  return [
    ...copy.sections
      .filter((section) => section.inToc !== false)
      .map((section) => ({
        id: section.id,
        title: section.title,
      })),
    ...(post.sources.length > 0 ? [{ id: "sources", title: blogArticleUi[locale].sources }] : []),
  ];
}
