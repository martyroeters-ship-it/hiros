import CareShell from "@/components/care/CareShell";
import { DashboardCareChat } from "@/components/dashboard/DashboardCareChat";
import { getSessionUser } from "@/lib/auth";
import { getPatientDashboardSnapshot } from "@/lib/patient-dashboard";

export const dynamic = "force-dynamic";

export default async function CareShellLayout({ children }: { children: React.ReactNode }) {
  const [snapshot, user] = await Promise.all([getPatientDashboardSnapshot(), getSessionUser()]);
  const firstName = user?.firstName?.trim() || user?.email?.split("@")[0] || null;

  return (
    <div className="h-dvh overflow-hidden font-[var(--font-dm-sans)] lg:h-screen">
      <CareShell unreadCount={snapshot.unreadMessageCount}>{children}</CareShell>
      <DashboardCareChat
        firstName={firstName}
        doctorName={snapshot.doctorName}
        treatmentName={snapshot.treatmentName}
        followUp={snapshot.treatmentFollowUp}
        isPremium={snapshot.isPremium}
      />
    </div>
  );
}
