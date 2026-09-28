import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import LegalDoc from "@/components/legal/LegalDoc";
import { privacyEn, privacyEs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — HomeTest",
  description: "How HomeTest processes your personal and health data. Política de privacidad en español incluida.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" subtitle="Política de privacidad" />
      <Section>
        <LegalDoc en={privacyEn} es={privacyEs} />
      </Section>
    </>
  );
}
