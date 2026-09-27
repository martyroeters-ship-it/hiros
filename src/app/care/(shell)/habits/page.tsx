import ActionPlan from "@/components/care/ActionPlan";
import { getCareLifestyleSnapshot } from "@/lib/care-lifestyle";
import { habitsLibraryCategories, pendingLifestyleCheckIns } from "@/lib/habitPlan";

export const dynamic = "force-dynamic";

export default async function CareHabitsPage() {
  const health = await getCareLifestyleSnapshot();
  return (
    <ActionPlan
      heading="Habits"
      categories={habitsLibraryCategories(health)}
      checkIns={pendingLifestyleCheckIns(health)}
      empty="Every habit that needs attention is in your Action Plan on Insights."
    />
  );
}
