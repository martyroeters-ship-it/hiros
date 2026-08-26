export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  slug: string;
  title: string;
  description: string;
  items: FaqItem[];
};

export const faqCategories: FaqCategory[] = [
  {
    slug: "how-hiros-works",
    title: "How Hiros works",
    description: "What Hiros is, how the online process works, and who is involved in your care.",
    items: [
      {
        question: "What is Hiros?",
        answer:
          "Hiros is a digital platform designed to make accessing care for personal health concerns simpler and more private. The platform helps you complete the initial steps online and connects you with independent licensed healthcare professionals where medical assessment is required.",
      },
      {
        question: "How does Hiros work?",
        answer:
          "You start by selecting your concern and completing a guided online assessment. Your information can then be shared with an appropriate licensed healthcare professional for review. Depending on your situation, additional information or a consultation may be required before any medical decision is made.",
      },
      {
        question: "Is Hiros a healthcare provider?",
        answer:
          "No. Hiros provides the technology and digital experience that helps facilitate access to care. Medical assessments, diagnoses, prescriptions and other clinical decisions are made independently by appropriately licensed healthcare professionals.",
      },
      {
        question: "Do I need to visit a clinic?",
        answer:
          "Not necessarily. Parts of the process can be completed remotely. Whether an in-person appointment or additional examination is necessary depends on your individual situation and is determined by the healthcare professional involved in your care.",
      },
      {
        question: "What health concerns does Hiros support?",
        answer:
          "Hiros is being developed around personal health concerns that people may prefer to approach privately and conveniently. Available pathways are shown on the platform and may expand over time.",
      },
    ],
  },
  {
    slug: "assessment-and-care",
    title: "Your assessment & care",
    description: "Medical decisions, eligibility, extra information, and follow-up.",
    items: [
      {
        question: "What happens after I complete an assessment?",
        answer:
          "Your responses provide the healthcare professional with information relevant to your concern. They may review the information, request additional details or determine that another form of assessment is necessary.",
      },
      {
        question: "Who decides what care is appropriate for me?",
        answer:
          "Medical decisions are made by the licensed healthcare professional responsible for your assessment. Hiros does not diagnose conditions, determine your eligibility for prescription medication or make prescribing decisions.",
      },
      {
        question: "Does completing an assessment guarantee that I will receive a prescription?",
        answer:
          "No. Completing an assessment does not guarantee a diagnosis, prescription or particular treatment. The healthcare professional decides what, if anything, is medically appropriate for you.",
      },
      {
        question: "What if the doctor needs more information?",
        answer:
          "You may be asked to provide additional information or complete a consultation before the healthcare professional can make a decision.",
      },
      {
        question: "What happens after the initial assessment?",
        answer:
          "Where applicable, the digital experience can help you keep track of your care and complete follow-ups over time. The exact follow-up process depends on the service and the healthcare professional involved.",
      },
    ],
  },
  {
    slug: "account-and-privacy",
    title: "Account & privacy",
    description: "Who can see your information, data requests, and discreet communication.",
    items: [
      {
        question: "Who can see my information?",
        answer:
          "Access to your information is limited according to its purpose. Information needed for a medical assessment may be made available to the healthcare professional involved, while Hiros may process information required to operate the platform. Further details are provided in our [Privacy Policy](/privacy) and [KVKK information notices](/health-privacy).",
      },
      {
        question: "Does Hiros keep my information private?",
        answer:
          "Hiros is designed with privacy in mind, particularly because personal health concerns can involve sensitive information. Personal data is handled according to applicable privacy and data-protection requirements.",
      },
      {
        question: "Will anyone know what I’m using Hiros for?",
        answer:
          "We aim to keep communication discreet and only use personal information for the purposes explained to you. Where physical delivery is involved, we also aim to keep packaging appropriately discreet.",
      },
      {
        question: "Can I request access to or deletion of my information?",
        answer:
          "You can [contact us](/contact) regarding your personal data and exercise applicable rights under Turkish data-protection law. Certain information may need to be retained where there is a legal obligation to do so.",
      },
      {
        question: "Why do you need personal information?",
        answer:
          "Different information is required for different purposes. Some information enables Hiros to operate your account and the platform, while information required for medical assessment is used within the healthcare process. We aim to collect only information that has a legitimate purpose.",
      },
    ],
  },
  {
    slug: "prescriptions-and-pharmacy",
    title: "Prescriptions & pharmacy",
    description: "Who can prescribe, what happens after a prescription, and fulfilment.",
    items: [
      {
        question: "Can Hiros prescribe medication?",
        answer:
          "No. Hiros does not prescribe medication. Any prescription decision is made independently by an appropriately licensed healthcare professional after assessing whether it is medically appropriate.",
      },
      {
        question: "Will completing the online assessment result in a prescription?",
        answer:
          "Not necessarily. The assessment is one part of the process. A healthcare professional may decide that further information, a consultation, another form of care or no prescription is appropriate.",
      },
      {
        question: "Who issues my prescription?",
        answer:
          "Where prescription medication is considered appropriate, the prescription is issued by the licensed healthcare professional responsible for the medical decision, in accordance with applicable Turkish requirements.",
      },
      {
        question: "Where does medication come from?",
        answer: "Prescription medication is dispensed through appropriately authorised pharmacy channels. Hiros itself is not a pharmacy.",
      },
      {
        question: "Can I request a particular medication?",
        answer:
          "You can provide relevant information about your situation and previous experiences, but the healthcare professional remains responsible for determining whether any particular treatment is appropriate.",
      },
    ],
  },
  {
    slug: "orders-and-delivery",
    title: "Orders & delivery",
    description: "Delivery, tracking, packaging, and changing an address.",
    items: [
      {
        question: "How will I know when my order has been sent?",
        answer:
          "Where delivery is available through the relevant service, you will receive information about the status of your order and any available tracking details.",
      },
      {
        question: "Is the packaging discreet?",
        answer:
          "Where Hiros coordinates the customer experience around delivery, discretion is an important part of the process. Packaging should not unnecessarily disclose sensitive information about your health concern.",
      },
      {
        question: "Can I change my delivery address?",
        answer:
          "If your order has not yet been processed for dispatch, it may be possible to update the delivery address. [Contact support](/contact) as soon as possible if you need to make a change.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Delivery times depend on the pharmacy, destination and fulfilment method. The applicable delivery estimate will be shown or communicated during the process.",
      },
    ],
  },
  {
    slug: "payments-and-support",
    title: "Payments & support",
    description: "Pricing, payments, refunds, and how to reach us.",
    items: [
      {
        question: "How much does Hiros cost?",
        answer: "Pricing depends on the service you choose. Any applicable costs will be shown clearly before you make a payment.",
      },
      {
        question: "Are there any hidden fees?",
        answer:
          "We aim to show applicable Hiros charges clearly before payment. Where a separate healthcare provider, pharmacy or other third party charges for a service, this should also be made clear during the relevant part of the process.",
      },
      {
        question: "How can I contact Hiros?",
        answer:
          "You can contact the Hiros team directly through our [support channels](/contact). During our initial launch, we’re keeping support deliberately personal so that questions can be handled by a real member of our team.",
      },
      {
        question: "Can I contact you through WhatsApp?",
        answer:
          "Yes. You can reach the Hiros team through WhatsApp for questions about Hiros, your account and how the process works.",
      },
      {
        question: "Can Hiros support answer medical questions?",
        answer:
          "Our support team can help with the Hiros platform and process, but cannot provide medical advice. Questions about symptoms, side effects, diagnoses or treatment decisions should be addressed by an appropriate healthcare professional.",
      },
    ],
  },
];

export function getFaqCategory(slug: string) {
  return faqCategories.find((category) => category.slug === slug);
}
