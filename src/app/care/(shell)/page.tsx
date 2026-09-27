import { CareHome } from "@/components/care/CareHome";
import { getCareLifestyleSnapshot } from "@/lib/care-lifestyle";
import { getPatientDashboardSnapshot } from "@/lib/patient-dashboard";

export const dynamic = "force-dynamic";

export default async function CarePage() {
  const [snapshot, health] = await Promise.all([getPatientDashboardSnapshot(), getCareLifestyleSnapshot()]);
  return <CareHome initial={snapshot} health={health} />;
}
