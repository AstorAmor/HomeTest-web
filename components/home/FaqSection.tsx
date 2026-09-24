import Link from "next/link";
import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import FaqAccordion from "./FaqAccordion";
import { faq, siteCopy } from "@/lib/content";

export default function FaqSection() {
  const { faq_seccion } = siteCopy;

  return (
    <Section soft>
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          title={faq_seccion.titulo_seccion}
          subtitle={faq_seccion.subtitulo_seccion}
        />
        <Link
          href="/contacto"
          className="whitespace-nowrap text-sm font-semibold text-accent-light hover:text-accent"
        >
          {faq_seccion.cta_contacto} →
        </Link>
      </div>

      <div className="mt-10">
        <FaqAccordion preguntas={faq.preguntas} />
      </div>
    </Section>
  );
}
