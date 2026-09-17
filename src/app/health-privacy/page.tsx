import type { Metadata } from "next";
import LocalizedLegalPage from "@/components/LocalizedLegalPage";

export const metadata: Metadata = {
  title: "Tüketici/Hasta Sağlık Verisi Gizlilik Politikası | Hiros",
  description: "Hiros partner klinikleri üzerinden işlenen hasta sağlık verisi için ileriye dönük politika.",
};

export default function HealthPrivacyPage() {
  return <LocalizedLegalPage doc="healthPrivacy" />;
}
