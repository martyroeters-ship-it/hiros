import type { Metadata } from "next";
import LocalizedLegalPage from "@/components/LocalizedLegalPage";

export const metadata: Metadata = {
  title: "Şartlar ve Koşullar | Hiros",
  description: "Hiros web sitesine ve demoya erişimi yöneten şartlar ve koşullar.",
};

export default function TermsPage() {
  return <LocalizedLegalPage doc="terms" />;
}
