"use client";

import { useState } from "react";

/* ─── shared primitives ──────────────────────────────────────────── */
function SectionHeader({ label }: { label: string }) {
  return <p className="mb-1.5 ml-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a9288]">{label}</p>;
}
function Divider() { return <div className="ml-4 h-px bg-[#f0ebe2]" />; }
function Card({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_4px_rgba(31,51,41,0.06)]">{children}</div>;
}
function Row({ label, chevron = true, destructive = false, onClick }: { label: string; chevron?: boolean; destructive?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[#f5f3ee] active:bg-[#edeae4]">
      <span className={`text-[14px] font-medium ${destructive ? "text-[#c0392b]" : "text-[#1f3329]"}`}>{label}</span>
      {chevron && (
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-[#b0aba3]" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={enabled} onClick={() => onChange(!enabled)}
      className={`relative h-[28px] w-[50px] rounded-full transition-colors duration-200 ${enabled ? "bg-[#1f4033]" : "bg-[#d4d0c8]"}`}>
      <span className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-all duration-200 ${enabled ? "left-[25px]" : "left-[3px]"}`} />
    </button>
  );
}
function ToggleRow({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[14px] font-medium text-[#1f3329]">{label}</span>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ treatment: true, messages: true, photos: true, orders: true });
  const [physicianAccess, setPhysicianAccess] = useState(true);
  const [language, setLanguage] = useState<"en" | "tr">("en");
  const toggle = (key: keyof typeof notifications) => setNotifications((n) => ({ ...n, [key]: !n[key] }));

  return (
    <div className="overflow-y-auto pb-6 pr-1">
      <div className="mb-6">
        <p className="text-[12px] font-medium text-[#8a9288]">Preferences</p>
        <h1 className="font-title text-[24px] font-medium tracking-[-0.03em] text-[#1f3329] lg:text-[28px]">Settings</h1>
      </div>

      <div className="flex flex-col gap-6">

        {/* Notifications */}
        <div>
          <SectionHeader label="Notifications" />
          <Card>
            <ToggleRow label="Treatment reminders" enabled={notifications.treatment} onChange={() => toggle("treatment")} />
            <Divider />
            <ToggleRow label="Message notifications" enabled={notifications.messages} onChange={() => toggle("messages")} />
            <Divider />
            <ToggleRow label="Progress photo reminders" enabled={notifications.photos} onChange={() => toggle("photos")} />
            <Divider />
            <ToggleRow label="Order updates" enabled={notifications.orders} onChange={() => toggle("orders")} />
          </Card>
        </div>

        {/* Physician access */}
        <div>
          <SectionHeader label="Physician access" />
          <Card>
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-[#1f3329]">Share treatment data with physician</p>
                <Toggle enabled={physicianAccess} onChange={setPhysicianAccess} />
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-[#8a9288]">
                Allows your physician to review adherence, progress photos, side effects and check-ins.
              </p>
            </div>
          </Card>
        </div>

        {/* Privacy & data */}
        <div>
          <SectionHeader label="Privacy & data" />
          <Card>
            <Row label="Download my data" />
            <Divider />
            <Row label="Privacy policy" />
            <Divider />
            <Row label="Terms of service" />
            <Divider />
            <Row label="Delete account" destructive />
          </Card>
        </div>

        {/* Support */}
        <div>
          <SectionHeader label="Support" />
          <Card>
            <Row label="Contact support" />
            <Divider />
            <Row label="FAQ" />
          </Card>
        </div>

        {/* Language */}
        <div>
          <SectionHeader label="Language" />
          <Card>
            <button type="button" onClick={() => setLanguage("en")} className="flex w-full items-center justify-between px-4 py-3.5 transition-colors hover:bg-[#f5f3ee]">
              <span className="text-[14px] font-medium text-[#1f3329]">English</span>
              {language === "en" && <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#1f4033]" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
            <Divider />
            <button type="button" onClick={() => setLanguage("tr")} className="flex w-full items-center justify-between px-4 py-3.5 transition-colors hover:bg-[#f5f3ee]">
              <span className="text-[14px] font-medium text-[#1f3329]">Türkçe</span>
              {language === "tr" && <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#1f4033]" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
          </Card>
        </div>

      </div>
    </div>
  );
}
