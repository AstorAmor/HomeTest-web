import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import ComingSoon from "@/components/prelaunch/ComingSoon";
import Portada from "@/components/inicio/Portada";
import Pasos from "@/components/inicio/Pasos";
import EdadKuova from "@/components/inicio/EdadKuova";
import { Intro, ListaEspera, Preguntas, Privacidad } from "@/components/inicio/Secciones";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";
import { PRELAUNCH } from "@/lib/launch";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return pageMetadata("home", "/");
}

// Portada: mensaje principal, los siete pasos de "Cómo funciona" con sus escenas animadas,
// Tu edad KUOVA, privacidad, preguntas y lista de espera.
// Textos en content/inicio.json (y content/en/inicio.json).
export default function Home() {
  if (PRELAUNCH) return <ComingSoon />;

  const lang = getLang();
  const { inicio } = getContent(lang);

  return (
    <>
      <JsonLd data={serviceJsonLd(lang)} />
      <JsonLd data={faqJsonLd(inicio.preguntas.lista)} />
      <Portada copy={inicio.hero} lang={lang} />
      <Intro copy={inicio.intro} />
      <Pasos copy={inicio} lang={lang} />
      <EdadKuova copy={inicio.edad} lang={lang} />
      <Privacidad copy={inicio.datos} />
      <Preguntas copy={inicio.preguntas} />
      <ListaEspera copy={inicio.lista} lang={lang} />
    </>
  );
}
