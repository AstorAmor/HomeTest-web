import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import LegalDoc from "@/components/legal/LegalDoc";
import { termsEn, termsEs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Use — HomeTest",
  description: "Terms of use of the HomeTest app and website. Condiciones de uso en español incluidas.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Use" subtitle="Condiciones de uso" />
      <Section>
        <LegalDoc en={termsEn} es={termsEs} />
      </Section>
    </>
  );
}
