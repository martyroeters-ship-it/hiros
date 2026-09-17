import type { Metadata } from "next";
import LocalizedLegalPage from "@/components/LocalizedLegalPage";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Hiros",
  description: "Hiros’un web sitesi ve iletişim formu verileri için KVKK aydınlatma metni.",
};

export default function PrivacyPage() {
  return <LocalizedLegalPage doc="privacy" />;
}
