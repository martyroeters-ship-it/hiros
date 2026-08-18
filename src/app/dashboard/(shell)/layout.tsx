import DashboardShell from "@/components/dashboard/DashboardShell";
import { DashboardCareChat } from "@/components/dashboard/DashboardCareChat";

export default function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh overflow-hidden bg-gradient-to-br from-[#e8ece6] via-[#e2e7e0] to-[#d8ddd4] font-[var(--font-dm-sans)] text-[#1f3329] lg:h-screen">
      <DashboardShell>{children}</DashboardShell>
      <DashboardCareChat />
    </div>
  );
}
