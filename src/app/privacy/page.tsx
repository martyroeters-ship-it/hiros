import type { Metadata } from "next";
import { LegalPage, LegalSection, legalLinkClassName } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Hiros",
  description: "KVKK aydınlatma metni for website and contact-form data processed by Hiros.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy (KVKK Aydınlatma Metni)" lastUpdated="21 August 2026">
      <LegalSection title="Data Controller">
        <p>
          For the purposes of this website and the Hiros contact/demo process, the data controller (veri sorumlusu) is
          Hiros, currently being established as a legal entity in the Republic of Türkiye. Contact:{" "}
          <a href="mailto:info@hiros.com.tr" className={legalLinkClassName}>
            info@hiros.com.tr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="What We Currently Collect">
        <p>
          At this stage, this website collects only the information you voluntarily submit through our contact form: name,
          email address, professional affiliation (if provided), and message content. We do not currently use analytics or
          tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="Legal Basis">
        <p>
          We process this data under Article 5(2)(c) of KVKK — processing necessary for the establishment or performance
          of a contract or pre-contractual negotiation — and Article 5(2)(f), our legitimate interest in responding to
          inquiries, where applicable.
        </p>
      </LegalSection>

      <LegalSection title="Purpose">
        <p>
          To respond to inquiries from physicians, clinics, and other parties interested in Hiros, and to arrange product
          demonstrations.
        </p>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          Contact submissions are retained only as long as necessary to respond to and follow up on the inquiry, or as
          required by law, after which they are deleted or anonymized.
        </p>
      </LegalSection>

      <LegalSection title="Recipients and Transfers">
        <p>
          Data is not sold or shared with third parties for marketing purposes. Where a service provider (e.g., email
          hosting) processes this data on our behalf, this is limited to what’s necessary to operate that service. Given
          the founding team’s base in the Netherlands, some data may be processed on infrastructure located outside
          Türkiye; where this involves a cross-border transfer, we will rely on the mechanisms permitted under KVKK
          Article 9 (e.g., explicit consent, or a KVKK Board-approved transfer mechanism once applicable).
        </p>
      </LegalSection>

      <LegalSection title="Your Rights (KVKK Article 11)">
        <p>
          You have the right to learn whether your data is processed, request information about it, learn the purpose of
          processing, know third parties it’s shared with, request correction or deletion, and object to results produced
          by automated analysis. Requests can be sent to{" "}
          <a href="mailto:info@hiros.com.tr" className={legalLinkClassName}>
            info@hiros.com.tr
          </a>
          . If unresolved, you may lodge a complaint with the Turkish Personal Data Protection Board (Kişisel Verileri
          Koruma Kurumu).
        </p>
      </LegalSection>

      <LegalSection title="VERBİS">
        <p>
          Registration with the Data Controllers’ Registry (VERBİS) is required for most data controllers above certain
          size/activity thresholds set by the KVKK Board. Confirm applicability with counsel once Hiros’ legal entity and
          headcount are finalized.
        </p>
      </LegalSection>

      <LegalSection title="Future Scope">
        <p>
          This policy currently covers only website/contact-form data. Once Hiros processes patient health data through
          partner clinics, that processing will be governed by the separate{" "}
          <a href="/health-privacy" className={legalLinkClassName}>
            Consumer/Patient Health Data Privacy Policy
          </a>
          , and this policy will be updated to cross-reference it.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
