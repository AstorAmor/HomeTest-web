import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import FaqAccordion from "@/components/home/FaqAccordion";
import JsonLd from "@/components/seo/JsonLd";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata("faq", "/faq");
}

export default function FaqPage() {
  const { siteCopy, faq } = getContent(getLang());
  const { pagina_faq } = siteCopy;

  return (
    <>
      <JsonLd data={faqJsonLd(faq.preguntas)} />
      <PageHero title={pagina_faq.titulo_hero} subtitle={pagina_faq.subtitulo_hero} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <FaqAccordion preguntas={faq.preguntas} />
        </div>
      </Section>
    </>
  );
}
