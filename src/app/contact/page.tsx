import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Bize ulaşın | Hiros",
  description: "Hiros hakkında bir sorunuz mu var? SSS ile başlayın veya destek ekibimize yazın.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
