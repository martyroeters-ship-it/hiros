"use client";

import { useEffect, useState } from "react";
import { DoctorChrome } from "../shell";
import {
  defaultDoctorSettings,
  loadDoctorSettings,
  saveDoctorSettings,
  type DoctorSettings,
} from "../settings-store";

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative h-[28px] w-[50px] rounded-full transition-colors ${enabled ? "bg-[#2f5f4f]" : "bg-black/15"}`}
    >
      <span
        className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-all ${
          enabled ? "left-[25px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

export default function DoctorSettingsPage() {
  const [settings, setSettings] = useState<DoctorSettings>(defaultDoctorSettings);

  useEffect(() => {
    setSettings(loadDoctorSettings());
  }, []);

  const update = (patch: Partial<DoctorSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveDoctorSettings(next);
  };

  return (
    <DoctorChrome active="settings" title="Settings">
      <main className="mx-auto w-full min-w-0 max-w-6xl space-y-4 px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
        <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Appearance</h2>
          <p className="mt-1 text-[13px] text-black/45">Applies to the doctor portal on this device.</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium text-[#1f241b]">Dark theme</p>
              <p className="text-[12.5px] text-black/45">Dim the charts and lists for evening work.</p>
            </div>
            <Toggle enabled={settings.theme === "dark"} onChange={(on) => update({ theme: on ? "dark" : "light" })} />
          </div>
        </section>

        <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Language</h2>
          <div className="mt-3 flex gap-2">
            {(
              [
                { key: "en" as const, label: "English" },
                { key: "tr" as const, label: "Türkçe" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => update({ language: item.key })}
                className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${
                  settings.language === item.key
                    ? "bg-[#2f5f4f] text-white"
                    : "border border-black/10 bg-white text-[#2b2a28]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Notifications</h2>
          <div className="mt-3 divide-y divide-black/[0.06]">
            <div className="flex items-center justify-between py-3">
              <p className="text-[14px] font-medium text-[#1f241b]">New cases</p>
              <Toggle enabled={settings.notifyCases} onChange={(on) => update({ notifyCases: on })} />
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-[14px] font-medium text-[#1f241b]">Visit requests</p>
              <Toggle enabled={settings.notifyVisits} onChange={(on) => update({ notifyVisits: on })} />
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-[14px] font-medium text-[#1f241b]">Unread messages</p>
              <Toggle enabled={settings.notifyMessages} onChange={(on) => update({ notifyMessages: on })} />
            </div>
          </div>
        </section>

        <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">Working hours</h2>
          <p className="mt-1 text-[13px] text-black/45">Used when proposing visit slots.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {DAYS.map((day) => {
              const on = settings.workDays.includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() =>
                    update({
                      workDays: on
                        ? settings.workDays.filter((item) => item !== day.key)
                        : [...settings.workDays, day.key],
                    })
                  }
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                    on ? "bg-[#2f5f4f] text-white" : "border border-black/10 text-[#2b2a28]"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-[12px] font-semibold text-[#1f241b]">
              Start
              <input
                type="time"
                value={settings.workStart}
                onChange={(e) => update({ workStart: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-[13.5px] font-medium outline-none"
              />
            </label>
            <label className="text-[12px] font-semibold text-[#1f241b]">
              End
              <input
                type="time"
                value={settings.workEnd}
                onChange={(e) => update({ workEnd: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-[13.5px] font-medium outline-none"
              />
            </label>
            <label className="text-[12px] font-semibold text-[#1f241b]">
              Default visit
              <select
                value={settings.visitMinutes}
                onChange={(e) => update({ visitMinutes: Number(e.target.value) as 15 | 20 | 30 })}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-[13.5px] font-medium outline-none"
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </label>
          </div>
        </section>
      </main>
    </DoctorChrome>
  );
}
