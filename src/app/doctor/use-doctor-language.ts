"use client";

import { useEffect, useState } from "react";
import { doctorCopy, type DoctorCopy, type DoctorLocale } from "./copy";
import { DOCTOR_SETTINGS_EVENT, loadDoctorSettings, saveDoctorSettings } from "./settings-store";

export function useDoctorLanguage(): {
  language: DoctorLocale;
  copy: DoctorCopy;
  setLanguage: (language: DoctorLocale) => void;
} {
  const [language, setLanguageState] = useState<DoctorLocale>("en");

  useEffect(() => {
    const apply = () => setLanguageState(loadDoctorSettings().language);
    apply();
    window.addEventListener(DOCTOR_SETTINGS_EVENT, apply);
    return () => window.removeEventListener(DOCTOR_SETTINGS_EVENT, apply);
  }, []);

  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [language]);

  const setLanguage = (next: DoctorLocale) => {
    saveDoctorSettings({ ...loadDoctorSettings(), language: next });
  };

  return { language, copy: doctorCopy[language], setLanguage };
}
