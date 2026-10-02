import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import HowItWorks from "@/components/landing/HowItWorks";
import Button from "@/components/ui/Button";
import { getContent } from "@/lib/content";
import { getLang, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata("como_funciona", "/como-funciona");
}

export default function ComoFuncionaPage() {
  const lang = getLang();
  const { siteCopy } = getContent(lang);
  const { pagina_como_funciona, home } = siteCopy;

  return (
    <>
      <PageHero title={pagina_como_funciona.titulo_hero} subtitle={pagina_como_funciona.subtitulo_hero} />
      <HowItWorks copy={siteCopy} showHeading={false} />
      <Section>
        <p className="max-w-2xl text-text-muted">{pagina_como_funciona.nota_final}</p>
        <div className="mt-8">
          <Button href={localePath(lang, "/#lista-de-espera")}>{home.hero.cta_principal}</Button>
        </div>
      </Section>
    </>
  );
}
