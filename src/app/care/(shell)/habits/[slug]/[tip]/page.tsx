import { notFound, redirect } from "next/navigation";
import HabitTipView from "@/components/care/HabitTipView";
import { getHairHabitTip, hairHabitCategories } from "@/data/hairHabits";
import { getCareLifestyleSnapshot } from "@/lib/care-lifestyle";
import { habitNeedsAttention } from "@/lib/habitPlan";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return hairHabitCategories.flatMap((category) =>
    category.tips.map((tip) => ({ slug: category.slug, tip: tip.slug })),
  );
}

export default async function CareHabitTipPage({
  params,
}: {
  params: Promise<{ slug: string; tip: string }>;
}) {
  const { slug, tip: tipSlug } = await params;
  const match = getHairHabitTip(slug, tipSlug);
  if (!match) notFound();
  const health = await getCareLifestyleSnapshot();
  if (slug === "nutrition" && health.nutrition === null) redirect("/care/check-in/nutrition");
  if (slug === "sleep" && health.sleep === null) redirect("/care/check-in/sleep");
  return (
    <HabitTipView
      category={match.category}
      tip={match.tip}
      heading={habitNeedsAttention(slug, health) ? "Action Plan" : "Habits"}
    />
  );
}
