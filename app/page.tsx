import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import StatStrip from "@/components/landing/StatStrip";
import Biomarkers from "@/components/landing/Biomarkers";
import AppShowcase from "@/components/landing/AppShowcase";
import ActionPlan from "@/components/landing/ActionPlan";
import HowItWorks from "@/components/landing/HowItWorks";
import Professionals from "@/components/landing/Professionals";
import KeyFacts from "@/components/landing/KeyFacts";
import FaqBlock from "@/components/landing/FaqBlock";
import FinalCta from "@/components/landing/FinalCta";
import JsonLd from "@/components/seo/JsonLd";
import ComingSoon from "@/components/prelaunch/ComingSoon";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";
import { PRELAUNCH } from "@/lib/launch";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const meta = pageMetadata("home", "/");
  // En pre-lanzamiento hay una sola portada (/en redirige a /): sin versiones por idioma
  return PRELAUNCH ? { ...meta, alternates: { canonical: "/" } } : meta;
}

// Portada: del mensaje principal a la lista de espera, con "cómo funciona" hacia abajo.
// Textos en content/site-copy.json (y content/en/) → "home".
export default function Home() {
  if (PRELAUNCH) return <ComingSoon />;

  const lang = getLang();
  const { siteCopy, panel, panelTotal, faq } = getContent(lang);

  return (
    <>
      <JsonLd data={serviceJsonLd(lang)} />
      <JsonLd data={faqJsonLd(faq.preguntas)} />
      <Hero copy={siteCopy} lang={lang} />
      <StatStrip copy={siteCopy} />
      <Biomarkers copy={siteCopy} lang={lang} panel={panel} />
      <AppShowcase copy={siteCopy} />
      <ActionPlan copy={siteCopy} />
      <HowItWorks copy={siteCopy} />
      <Professionals copy={siteCopy} />
      <KeyFacts copy={siteCopy} total={panelTotal} systems={panel.length} />
      <FaqBlock copy={siteCopy} lang={lang} preguntas={faq.preguntas} />
      <FinalCta copy={siteCopy} />
    </>
  );
}
