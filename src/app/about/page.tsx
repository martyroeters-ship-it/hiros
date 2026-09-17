import type { Metadata } from "next";
import AboutPageContent from "@/components/AboutPageContent";

export const metadata: Metadata = {
  title: "Hakkımızda | Hiros",
  description:
    "Hiros, kişisel sağlık konularında bakıma ulaşmayı daha basit, daha özel ve daha kolay hale getirmek için kuruldu.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
