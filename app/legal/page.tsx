import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import { siteCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: siteCopy.seo.legal.title,
  description: siteCopy.seo.legal.description,
};

export default function LegalPage() {
  const { pagina_legal } = siteCopy;

  return (
    <>
      <PageHero title={pagina_legal.titulo_hero} subtitle={pagina_legal.subtitulo_hero} />

      <Section>
        <div className="mx-auto max-w-3xl space-y-12">
          <div>
            <h2 className="text-2xl font-semibold text-text">
              {pagina_legal.aviso_legal_titulo}
            </h2>
            <p className="mt-4 whitespace-pre-line text-text-muted">
              {pagina_legal.aviso_legal_texto}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-text">
              {pagina_legal.privacidad_titulo}
            </h2>
            <p className="mt-4 whitespace-pre-line text-text-muted">
              {pagina_legal.privacidad_texto}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
