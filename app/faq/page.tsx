import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import FaqAccordion from "@/components/home/FaqAccordion";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  const { seo } = getContent(getLang()).siteCopy;
  return { title: seo.faq.title, description: seo.faq.description };
}

export default function FaqPage() {
  const { siteCopy, faq } = getContent(getLang());
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
