import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import FaqAccordion from "@/components/home/FaqAccordion";
import { faq, siteCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: siteCopy.seo.faq.title,
  description: siteCopy.seo.faq.description,
};

export default function FaqPage() {
  const { pagina_faq } = siteCopy;

  return (
    <>
      <PageHero title={pagina_faq.titulo_hero} subtitle={pagina_faq.subtitulo_hero} />

      <Section>
        <div className="mx-auto max-w-3xl">
          <FaqAccordion preguntas={faq.preguntas} />
        </div>
      </Section>
    </>
  );
}
