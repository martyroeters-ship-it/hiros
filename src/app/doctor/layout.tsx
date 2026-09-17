import type { Metadata } from "next";
import { getSessionUser, isStaffRole } from "@/lib/auth";
import { ready } from "@/lib/ensure-db";
import { doctorTabTitle } from "./copy";
import { DoctorLoginScreen } from "./login-screen";
import { DoctorNavBadgesProvider } from "./shell";
import "./doctor-theme.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: doctorTabTitle.en },
};

export default async function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ready();
  const user = await getSessionUser();
  if (!isStaffRole(user?.role)) {
    return <DoctorLoginScreen />;
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <DoctorNavBadgesProvider>{children}</DoctorNavBadgesProvider>
    </div>
  );
}
