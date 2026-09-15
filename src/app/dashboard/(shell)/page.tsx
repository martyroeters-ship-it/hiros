import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { getPatientDashboardSnapshot } from "@/lib/patient-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const snapshot = await getPatientDashboardSnapshot();
  return <DashboardHome initial={snapshot} />;
}
