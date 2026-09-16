"use client";

import { useEffect, useState } from "react";
import { DoctorChrome } from "../shell";
import {
  defaultDoctorSettings,
  loadDoctorSettings,
  saveDoctorSettings,
  type DoctorSettings,
} from "../settings-store";
import { useDoctorLanguage } from "../use-doctor-language";

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
  const { copy } = useDoctorLanguage();
  const [settings, setSettings] = useState<DoctorSettings>(defaultDoctorSettings);
  const days = [
    { key: "mon", label: copy.settings.days.mon },
    { key: "tue", label: copy.settings.days.tue },
    { key: "wed", label: copy.settings.days.wed },
    { key: "thu", label: copy.settings.days.thu },
    { key: "fri", label: copy.settings.days.fri },
    { key: "sat", label: copy.settings.days.sat },
    { key: "sun", label: copy.settings.days.sun },
  ];

  useEffect(() => {
    setSettings(loadDoctorSettings());
  }, []);

  const update = (patch: Partial<DoctorSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveDoctorSettings(next);
  };

  return (
    <DoctorChrome active="settings" title={copy.pages.settings}>
      <main className="mx-auto w-full min-w-0 max-w-6xl space-y-4 px-4 py-5 pb-28 sm:px-6 sm:py-8 lg:pb-8">
        <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">{copy.settings.appearance}</h2>
          <p className="mt-1 text-[13px] text-black/45">{copy.settings.appearanceHint}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium text-[#1f241b]">{copy.settings.darkTheme}</p>
              <p className="text-[12.5px] text-black/45">{copy.settings.darkHint}</p>
            </div>
            <Toggle enabled={settings.theme === "dark"} onChange={(on) => update({ theme: on ? "dark" : "light" })} />
          </div>
        </section>

        <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">{copy.settings.language}</h2>
          <div className="mt-3 flex gap-2">
            {(
              [
                { key: "en" as const, label: copy.settings.english },
                { key: "tr" as const, label: copy.settings.turkish },
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
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">{copy.settings.notifications}</h2>
          <div className="mt-3 divide-y divide-black/[0.06]">
            <div className="flex items-center justify-between py-3">
              <p className="text-[14px] font-medium text-[#1f241b]">{copy.settings.newCases}</p>
              <Toggle enabled={settings.notifyCases} onChange={(on) => update({ notifyCases: on })} />
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-[14px] font-medium text-[#1f241b]">{copy.settings.visitRequests}</p>
              <Toggle enabled={settings.notifyVisits} onChange={(on) => update({ notifyVisits: on })} />
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-[14px] font-medium text-[#1f241b]">{copy.settings.unreadMessages}</p>
              <Toggle enabled={settings.notifyMessages} onChange={(on) => update({ notifyMessages: on })} />
            </div>
          </div>
        </section>

        <section className="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f241b]">{copy.settings.hours}</h2>
          <p className="mt-1 text-[13px] text-black/45">{copy.settings.hoursHint}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {days.map((day) => {
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
              {copy.settings.start}
              <input
                type="time"
                value={settings.workStart}
                onChange={(e) => update({ workStart: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-[13.5px] font-medium outline-none"
              />
            </label>
            <label className="text-[12px] font-semibold text-[#1f241b]">
              {copy.settings.end}
              <input
                type="time"
                value={settings.workEnd}
                onChange={(e) => update({ workEnd: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-[13.5px] font-medium outline-none"
              />
            </label>
            <label className="text-[12px] font-semibold text-[#1f241b]">
              {copy.settings.defaultVisit}
              <select
                value={settings.visitMinutes}
                onChange={(e) => update({ visitMinutes: Number(e.target.value) as 15 | 20 | 30 })}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-[13.5px] font-medium outline-none"
              >
                <option value={15}>{copy.settings.minutes(15)}</option>
                <option value={20}>{copy.settings.minutes(20)}</option>
                <option value={30}>{copy.settings.minutes(30)}</option>
              </select>
            </label>
          </div>
        </section>
      </main>
    </DoctorChrome>
  );
}
