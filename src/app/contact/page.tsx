import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import FloatingChat from "@/components/FloatingChat";
import LegalHeader from "@/components/LegalHeader";
import SiteFooter from "@/components/SiteFooter";
import { HOME_PAGE_GUTTER_CLASS } from "@/constants/homeHeaderLayout";

export const metadata: Metadata = {
  title: "Contact us | Hiros",
  description: "Have a question about Hiros? Start with our FAQs, or contact our support team.",
};

const linkClassName = "font-semibold text-[#3f5f35] underline underline-offset-[3px]";

function ContactSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[#11110f] sm:text-[22px]">{title}</h3>
      {children}
    </section>
  );
}

export default function ContactPage() {
  return (
    <>
      <LegalHeader />
      <main className="min-h-screen overflow-x-clip bg-[#fbfaf5] text-[#11110f]">
        <section
          className={`relative flex min-h-[440px] items-center bg-[linear-gradient(115deg,#9aaf8c_0%,#e4dfd3_48%,#d2b09a_100%)] sm:min-h-[560px] ${HOME_PAGE_GUTTER_CLASS}`}
        >
          <div>
            <h1 className="font-title text-left text-[40px] font-normal leading-[1.02] tracking-[-0.06em] text-white sm:text-[56px] lg:text-[72px] lg:leading-[1] lg:tracking-[-0.07em]">
              Contact us
            </h1>
            <p className="mt-1 text-[16px] font-medium text-white/90 sm:mt-1.5 sm:text-[18px]">
              We are here for you.
            </p>
          </div>
        </section>

        <section className={`relative z-10 -mt-[34px] rounded-t-[34px] bg-[#fbfaf5] pb-28 pt-16 sm:pb-36 sm:pt-20 ${HOME_PAGE_GUTTER_CLASS}`}>
          <article className="max-w-[42rem] text-left">
            <p className="text-[13px] font-medium text-[#11110f]/45 sm:text-[14px]">
              <Link href="/" className="transition-colors hover:text-[#11110f]/70">
                Home
              </Link>
              {" / "}
              <span className="font-semibold text-[#3f5f35]">Contact us</span>
            </p>

            <h2 className="mt-10 font-title text-[32px] font-bold leading-[1.1] tracking-[-0.04em] text-[#11110f] sm:mt-12 sm:text-[40px]">
              Contact Us
            </h2>

            <div className="mt-12 space-y-12 text-[16px] font-medium leading-[1.7] text-[#2b2a28]/88 sm:mt-14 sm:space-y-14 sm:text-[17px] sm:leading-[1.75]">
              <ContactSection title="Have a question? Start with our FAQs.">
                <p>You may already find what you’re looking for in our frequently asked questions.</p>
                <p>
                  <Link href="/faq" className={linkClassName}>
                    Frequently asked questions
                  </Link>
                </p>
                <p>
                  Still need help? Our support team is here to help with questions about Hiros, your account, the
                  platform or your care journey.
                </p>
              </ContactSection>

              <ContactSection title="Need help? We’re here.">
                <p>
                  For general questions or support with the Hiros platform, contact us at{" "}
                  <a href="mailto:support@hiros.com.tr" className={linkClassName}>
                    support@hiros.com.tr
                  </a>
                  .
                </p>
                <p>You can also use the chat button on this website. We’ll get back to you as soon as possible.</p>
              </ContactSection>

              <ContactSection title="Support hours">
                <p>
                  <span className="font-bold text-[#11110f]">Monday – Friday, 09:00 – 20:00</span>
                </p>
              </ContactSection>

              <ContactSection title="Medical questions">
                <p>Have a question about your health, assessment or care?</p>
                <p>
                  Medical questions are handled by the independent healthcare professionals involved in your care. If you
                  already have an active case, you can contact your healthcare provider through your{" "}
                  <Link href="/dashboard" className={linkClassName}>
                    patient account
                  </Link>
                  .
                </p>
                <p>Hiros does not provide medical advice or make medical decisions.</p>
              </ContactSection>
            </div>
          </article>
        </section>

        <SiteFooter />
        <FloatingChat />
      </main>
    </>
  );
}
