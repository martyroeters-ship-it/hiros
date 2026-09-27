import { hairHabitCategories, type HairHabitCategory } from "@/data/hairHabits";
import type { CareLifestyleSnapshot } from "@/lib/care-lifestyle";

export type LifestyleCheckInCard = {
  slug: "nutrition" | "sleep";
  title: string;
  href: string;
  eyebrow: string;
};

export function habitNeedsAttention(slug: string, health: CareLifestyleSnapshot): boolean {
  if (slug === "stress") return health.reportedStress;
  if (slug === "nutrition") return health.nutrition === "needs_attention";
  if (slug === "sleep") return health.sleep === "needs_attention";
  return false;
}

export function pendingLifestyleCheckIns(health: CareLifestyleSnapshot): LifestyleCheckInCard[] {
  const cards: LifestyleCheckInCard[] = [];
  if (health.nutrition === null) {
    cards.push({
      slug: "nutrition",
      title: "Nutrition",
      href: "/care/check-in/nutrition",
      eyebrow: "3 short questions",
    });
  }
  if (health.sleep === null) {
    cards.push({
      slug: "sleep",
      title: "Sleep",
      href: "/care/check-in/sleep",
      eyebrow: "3 short questions",
    });
  }
  return cards;
}

export function actionPlanCategories(health: CareLifestyleSnapshot): HairHabitCategory[] {
  return hairHabitCategories.filter((category) => habitNeedsAttention(category.slug, health));
}

export function habitsLibraryCategories(health: CareLifestyleSnapshot): HairHabitCategory[] {
  return hairHabitCategories.filter((category) => {
    if (category.slug === "nutrition" && health.nutrition === null) return false;
    if (category.slug === "sleep" && health.sleep === null) return false;
    return !habitNeedsAttention(category.slug, health);
  });
}
