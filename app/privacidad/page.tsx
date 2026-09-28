import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import LegalDoc from "@/components/legal/LegalDoc";
import { privacyEn, privacyEs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Política de privacidad — HomeTest",
  description: "Cómo trata HomeTest tus datos personales y de salud. Privacy policy.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Política de privacidad" subtitle="Privacy Policy" />
      <Section>
        <LegalDoc es={privacyEs} en={privacyEn} />
      </Section>
    </>
  );
}
