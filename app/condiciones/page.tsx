import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import LegalDoc from "@/components/legal/LegalDoc";
import { termsEn, termsEs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Condiciones de uso — HomeTest",
  description: "Condiciones de uso de la app y la web de HomeTest. Terms of use.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="Condiciones de uso" subtitle="Terms of Use" />
      <Section>
        <LegalDoc es={termsEs} en={termsEn} />
      </Section>
    </>
  );
}
