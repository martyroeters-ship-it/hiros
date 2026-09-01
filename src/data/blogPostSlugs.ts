export const blogPostSlugs = [
  "why-hair-loss-happens",
  "minoxidil-vs-finasteride",
  "waiting-to-start-treatment",
  "oral-vs-topical-finasteride",
  "thicker-hair-for-men",
  "receding-hairline-early-signs",
  "dermaroller-minoxidil",
  "treatment-resistant-hair-loss",
  "damaged-hair-repair-for-men",
  "hair-regrowth-for-men",
  "microneedling-for-hair-loss",
  "make-minoxidil-more-effective",
  "is-minoxidil-permanent",
  "minoxidil-and-pets",
  "how-to-apply-minoxidil",
  "hairline-restoration",
  "looking-good-with-hair-loss",
  "how-to-take-progress-photos",
  "topical-finasteride-101",
  "topical-finasteride-results",
  "what-happens-when-you-stop-finasteride",
  "keeping-hair-on-finasteride",
] as const;

export function hasBlogPost(slug: string) {
  return (blogPostSlugs as readonly string[]).includes(slug);
}
