import type { Metadata } from "next";
import { LegalPage, LegalSection, legalLinkClassName, legalListClassName } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Consumer/Patient Health Data Privacy Policy | Hiros",
  description: "Forward-looking policy for patient health data processed through Hiros partner clinics.",
};

export default function HealthPrivacyPage() {
  return (
    <LegalPage title="Consumer/Patient Health Data Privacy Policy" lastUpdated="21 August 2026">
      <LegalSection title="Scope">
        <p>
          This policy governs health-related data processed through the Hiros platform once deployed by a partner clinic
          for real patient use: intake medical history, lifestyle and treatment goals, progress photographs, side-effect
          and adherence questionnaire responses, and physician notes entered into the platform.
        </p>
      </LegalSection>

      <LegalSection title="Roles: Controller and Processor">
        <p>
          Under KVKK, health data collected during a patient’s care is generally controlled by the treating clinic or
          physician (veri sorumlusu), who holds the direct relationship with the patient and the underlying legal basis
          for treatment. Hiros acts as the data processor (veri işleyen), processing this data solely on the clinic’s
          documented instructions, under a data processing agreement executed with each partner clinic. Hiros does not
          independently sell, license, or repurpose patient health data for its own commercial use.
        </p>
      </LegalSection>

      <LegalSection title="Legal Basis for Processing Health Data">
        <p>
          Health data is a special category of personal data under KVKK Article 6 and may only be processed with the
          patient’s explicit consent (açık rıza), or, without separate explicit consent, when processed for the purposes
          of protecting public health, preventive medicine, medical diagnosis, treatment, care, or health services
          planning and financing — by persons under a professional confidentiality obligation (such as physicians) or
          authorized institutions. In practice, the treating clinic obtains the applicable consent or relies on this
          statutory exception as part of its own patient intake process; Hiros processes the data strictly within that
          authorized scope as the clinic’s processor.
        </p>
        <p>
          Where Hiros itself needs a separate basis — for example, to use de-identified or aggregated data to improve the
          platform — this will only be done with the patient’s separate, specific, explicit consent, clearly distinguished
          from consent to treatment.
        </p>
      </LegalSection>

      <LegalSection title="What Is Collected and Why">
        <ul className={legalListClassName}>
          <li>
            Intake information (medical history, lifestyle, goals, contraindications) — to support the clinic’s structured
            assessment and physician decision-making.
          </li>
          <li>Progress photographs — to support visual continuity monitoring reviewed by the treating physician.</li>
          <li>
            Side-effect and adherence responses — to support ongoing monitoring and early identification of issues
            requiring physician attention.
          </li>
        </ul>
        <p>
          None of this data is used for advertising, sold to third parties, or shared outside the treating clinic’s care
          team except as required by law or with the patient’s explicit consent.
        </p>
      </LegalSection>

      <LegalSection title="Security Measures">
        <p>
          Consistent with KVKK Board guidance on special category data (including Board Decision No. 2022/594 on
          unauthorized disclosure of health data), Hiros applies encryption in transit and at rest, role-based access
          restricted to authorized clinical staff, audit logging of access to patient records, and confidentiality
          obligations for all personnel with system access.
        </p>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          Patient health data is retained for as long as the clinic requires it for ongoing care and as required under
          Turkish healthcare record-keeping obligations, after which it is deleted or anonymized in coordination with the
          clinic.
        </p>
      </LegalSection>

      <LegalSection title="Patient Rights">
        <p>
          Patients may exercise their KVKK Article 11 rights (access, correction, deletion, objection) by contacting their
          treating clinic directly, or Hiros at{" "}
          <a href="mailto:info@hiros.com.tr" className={legalLinkClassName}>
            info@hiros.com.tr
          </a>
          , who will coordinate with the relevant clinic as processor.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
