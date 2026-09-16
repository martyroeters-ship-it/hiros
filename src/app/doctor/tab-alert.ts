import { doctorTabTitle } from "./copy";
import { loadDoctorSettings } from "./settings-store";

const ICON_HREF = "/icon.png";

function baseTitle(): string {
  try {
    return doctorTabTitle[loadDoctorSettings().language];
  } catch {
    return doctorTabTitle.en;
  }
}

function restoreIcon() {
  for (const link of document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']")) {
    link.href = ICON_HREF;
  }
}

export function applyDoctorTabAlert(count: number): () => void {
  const pending = Math.max(0, count);
  const title = baseTitle();
  document.title = pending > 0 ? `(${pending}) ${title}` : title;
  restoreIcon();

  return () => {
    document.title = title;
    restoreIcon();
  };
}
