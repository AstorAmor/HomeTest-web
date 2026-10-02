import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import { getLang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import LegalDoc from "@/components/legal/LegalDoc";
import { termsEn, termsEs } from "@/content/legal";

export function generateMetadata(): Metadata {
  return pageMetadata("terms", "/terms");
}

export default function TermsPage() {
  return (
    <>
      {getLang() === "es" ? (
        <PageHero title="Condiciones de uso" subtitle="Terms of Use" />
      ) : (
        <PageHero title="Terms of Use" subtitle="Condiciones de uso" />
      )}
      <Section>
        <LegalDoc en={termsEn} es={termsEs} first={getLang()} />
      </Section>
    </>
  );
}
