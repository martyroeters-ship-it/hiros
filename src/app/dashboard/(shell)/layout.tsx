import DashboardShell from "@/components/dashboard/DashboardShell";
import { DashboardCareChat } from "@/components/dashboard/DashboardCareChat";
import { getSessionUser } from "@/lib/auth";
import { getPatientDashboardSnapshot } from "@/lib/patient-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const [snapshot, user] = await Promise.all([getPatientDashboardSnapshot(), getSessionUser()]);
  const firstName = user?.firstName?.trim() || user?.email?.split("@")[0] || null;

  return (
    <div className="h-dvh overflow-hidden bg-gradient-to-br from-[#e8ece6] via-[#e2e7e0] to-[#d8ddd4] font-[var(--font-dm-sans)] text-[#1f3329] lg:h-screen">
      <DashboardShell unreadCount={snapshot.unreadMessageCount}>{children}</DashboardShell>
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
