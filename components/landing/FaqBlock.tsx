import Link from "next/link";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import FaqAccordion from "../home/FaqAccordion";
import type { FaqItem, SiteCopy } from "@/lib/content";
import { localePath, type Lang } from "@/lib/i18n";

export default function FaqBlock({ copy, lang, preguntas }: { copy: SiteCopy; lang: Lang; preguntas: FaqItem[] }) {
  const { faq } = copy.home;
  return (
    <section className="bg-bg py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeading title={faq.titulo} subtitle={faq.subtitulo} />
            <Link href={localePath(lang, "/contacto")} className="mt-6 inline-block text-sm font-semibold text-accent-light hover:text-accent">
              {faq.cta} →
            </Link>
          </div>
          <FaqAccordion preguntas={preguntas} />
        </div>
      </Container>
    </section>
  );
}
