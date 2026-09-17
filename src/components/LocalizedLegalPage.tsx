"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { LegalNotice, LegalPage, LegalSection, legalLinkClassName, legalListClassName } from "@/components/LegalPage";
import { legalCopy, type LegalDocCopy, type LegalDocKey } from "@/i18n/legalCopy";
import { useHydratedLocale } from "@/i18n/LanguageProvider";

function LegalRichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const [, label, href] = link;
          if (href.startsWith("mailto:") || href.startsWith("http")) {
            return (
              <a key={index} href={href} className={legalLinkClassName}>
                {label}
              </a>
            );
          }
          return (
            <Link key={index} href={href} className={legalLinkClassName}>
              {label}
            </Link>
          );
        }

        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) {
          return <strong key={index}>{bold[1]}</strong>;
        }

        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

function BlockText({ text, wrapper: Wrapper }: { text: string; wrapper: "p" | "div" | "li" }) {
  const inner: ReactNode = <LegalRichText text={text} />;
  if (Wrapper === "p") return <p>{inner}</p>;
  if (Wrapper === "li") return <li>{inner}</li>;
  return <div>{inner}</div>;
}

export default function LocalizedLegalPage({ doc }: { doc: LegalDocKey }) {
  const locale = useHydratedLocale();
  const page: LegalDocCopy = legalCopy[locale][doc];

  return (
    <LegalPage title={page.title} lastUpdated={page.lastUpdated}>
      {page.introNotice ? (
        <LegalNotice>
          <LegalRichText text={page.introNotice} />
        </LegalNotice>
      ) : null}
      {page.sections.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.blocks.map((block, index) => {
            if (block.type === "p") {
              return <BlockText key={index} text={block.text} wrapper="p" />;
            }
            if (block.type === "notice") {
              return (
                <LegalNotice key={index}>
                  <LegalRichText text={block.text} />
                </LegalNotice>
              );
            }
            return (
              <ul key={index} className={legalListClassName}>
                {block.items.map((item) => (
                  <BlockText key={item} text={item} wrapper="li" />
                ))}
              </ul>
            );
          })}
        </LegalSection>
      ))}
    </LegalPage>
  );
}
