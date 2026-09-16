import { redirect } from "next/navigation";
import { getSessionUser, isStaffRole } from "@/lib/auth";
import { patientHasCompletedIntake } from "@/lib/cases-repo";
import { ready } from "@/lib/ensure-db";

export const dynamic = "force-dynamic";

export default async function IntakeLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user && !isStaffRole(user.role)) {
    await ready();
    if (await patientHasCompletedIntake(user.id)) redirect("/dashboard");
  }
  return children;
}
