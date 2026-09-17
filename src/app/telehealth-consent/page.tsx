import type { Metadata } from "next";
import LocalizedLegalPage from "@/components/LocalizedLegalPage";

export const metadata: Metadata = {
  title: "Tele-sağlık / Uzaktan Hizmet Onayı | Hiros",
  description: "Hiros üzerinden uzaktan takip bakımı için ileriye dönük onay.",
};

export default function TelehealthConsentPage() {
  return <LocalizedLegalPage doc="telehealth" />;
}
