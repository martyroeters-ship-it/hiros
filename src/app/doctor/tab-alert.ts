const BASE_TITLE = "Hiros | Saç Dökülmesi ve Erkek Sağlığı";
const ICON_HREF = "/icon.png";

function restoreIcon() {
  for (const link of document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']")) {
    link.href = ICON_HREF;
  }
}

export function applyDoctorTabAlert(count: number): () => void {
  const pending = Math.max(0, count);
  document.title = pending > 0 ? `(${pending}) ${BASE_TITLE}` : BASE_TITLE;
  restoreIcon();

  return () => {
    document.title = BASE_TITLE;
    restoreIcon();
  };
}
