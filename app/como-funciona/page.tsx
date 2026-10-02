import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import HowItWorksSteps from "@/components/home/HowItWorksSteps";
import Button from "@/components/ui/Button";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  const { seo } = getContent(getLang()).siteCopy;
  return { title: seo.como_funciona.title, description: seo.como_funciona.description };
}

export default function ComoFuncionaPage() {
  const { pagina_como_funciona, hero } = getContent(getLang()).siteCopy;

  return (
    <>
      <PageHero
        title={pagina_como_funciona.titulo_hero}
        subtitle={pagina_como_funciona.subtitulo_hero}
      />

      <Section>
        <h2 className="text-2xl font-semibold text-text">
          {pagina_como_funciona.seccion_detalle_titulo}
        </h2>
        <div className="mt-8">
          <HowItWorksSteps detailed />
        </div>

        <p className="mt-10 max-w-2xl text-text-muted">
          {pagina_como_funciona.nota_final}
        </p>

        <div className="mt-8">
          <Button href="/#lista-de-espera">{hero.cta_principal}</Button>
        </div>
      </Section>
    </>
  );
}
