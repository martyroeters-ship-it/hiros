export const DOCTOR_SETTINGS_KEY = "hiros-doctor-settings";
export const DOCTOR_SETTINGS_EVENT = "hiros-doctor-settings";

export type DoctorSettings = {
  theme: "light" | "dark";
  language: "en" | "tr";
  notifyCases: boolean;
  notifyVisits: boolean;
  notifyMessages: boolean;
  workStart: string;
  workEnd: string;
  visitMinutes: 15 | 20 | 30;
  workDays: string[];
};

export const defaultDoctorSettings: DoctorSettings = {
  theme: "light",
  language: "en",
  notifyCases: true,
  notifyVisits: true,
  notifyMessages: true,
  workStart: "09:00",
  workEnd: "17:00",
  visitMinutes: 20,
  workDays: ["mon", "tue", "wed", "thu", "fri"],
};

export function loadDoctorSettings(): DoctorSettings {
  try {
    const raw = localStorage.getItem(DOCTOR_SETTINGS_KEY);
    return raw ? { ...defaultDoctorSettings, ...(JSON.parse(raw) as Partial<DoctorSettings>) } : defaultDoctorSettings;
  } catch {
    return defaultDoctorSettings;
  }
}

export function saveDoctorSettings(next: DoctorSettings) {
  localStorage.setItem(DOCTOR_SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(DOCTOR_SETTINGS_EVENT));
}
