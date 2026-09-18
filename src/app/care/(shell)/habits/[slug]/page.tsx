import { notFound, redirect } from "next/navigation";
import ActionPlan from "@/components/care/ActionPlan";
import { getHairHabitCategory, hairHabitCategories } from "@/data/hairHabits";
import { getCareLifestyleSnapshot } from "@/lib/care-lifestyle";
import { actionPlanCategories, habitNeedsAttention, habitsLibraryCategories } from "@/lib/habitPlan";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return hairHabitCategories.map((category) => ({ slug: category.slug }));
}

export default async function CareHabitCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getHairHabitCategory(slug);
  if (!category) notFound();
  const health = await getCareLifestyleSnapshot();
  if (slug === "nutrition" && health.nutrition === null) redirect("/care/check-in/nutrition");
  if (slug === "sleep" && health.sleep === null) redirect("/care/check-in/sleep");
  const inPlan = habitNeedsAttention(slug, health);
  return (
    <ActionPlan
      openSlug={category.slug}
      heading={inPlan ? "Action Plan" : "Habits"}
      categories={inPlan ? actionPlanCategories(health) : habitsLibraryCategories(health)}
    />
  );
}
