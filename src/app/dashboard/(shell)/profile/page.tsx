"use client";

import { useRouter } from "next/navigation";
import { displayName, useSessionUser } from "@/lib/use-session-user";

function SectionHeader({ label }: { label: string }) {
  return <p className="mb-1.5 ml-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">{label}</p>;
}
function Divider() {
  return <div className="ml-4 h-px bg-[#f0ebe2]" />;
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_4px_rgba(31,51,41,0.06)]">{children}</div>;
}
function Row({ label, value, chevron = true }: { label: string; value?: string; chevron?: boolean }) {
  return (
    <button type="button" className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[#f5f3ee] active:bg-[#edeae4]">
      <span className="text-[14px] font-medium text-[#1f3329]">{label}</span>
      <span className="flex items-center gap-2">
        {value && <span className="text-[14px] text-[#9aa396]">{value}</span>}
        {chevron && (
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-[#b0aba3]" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useSessionUser();
  const name = user ? displayName(user) : "Account";
  const initial = (user?.firstName || user?.email || "H").slice(0, 1).toUpperCase();

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="overflow-y-auto pb-6 pr-1">
      <div className="mb-6">
        <p className="text-[12px] font-medium text-[#8a9288]">Your profile</p>
        <h1 className="font-title text-[24px] font-medium tracking-[-0.03em] text-[#1f3329] lg:text-[28px]">Account</h1>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-[16px] bg-[#1f4033] px-5 py-4 shadow-[0_4px_20px_rgba(31,64,51,0.15)]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-[20px] font-semibold text-white">
          {initial}
        </div>
        <div>
          <p className="text-[16px] font-semibold text-white">{user === undefined ? "…" : name}</p>
          <p className="text-[13px] text-white/60">{user?.email || (user === null ? "Not signed in" : "")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <SectionHeader label="Account" />
          <div className="flex flex-col gap-3">
            <Card>
              <div className="px-4 pb-1 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9aa396]">Personal information</p>
              </div>
              <Row label="Full name" value={name || "Not set"} />
              <Divider />
              <Row label="Email" value={user?.email || "Not set"} />
              <Divider />
              <Row label="Phone number" value={user?.phone || "Not set"} />
            </Card>

            <Card>
              <div className="px-4 pb-1 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9aa396]">Shipping address</p>
              </div>
              <Row label="City" value={user?.city || "Not set"} />
              <Divider />
              <Row label="Postal code" value={user?.postalCode || "Not set"} />
            </Card>

            {user ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-[16px] bg-white px-4 py-3.5 text-left text-[14px] font-medium text-[#c0392b] shadow-[0_1px_4px_rgba(31,51,41,0.06)]"
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
