import type { Metadata } from "next";
import { getContent, type FaqItem, type SiteCopy } from "@/lib/content";
import { getLang, localePath, type Lang } from "@/lib/i18n";
import { PRELAUNCH } from "@/lib/launch";

// Dirección pública de la web. Cuando haya dominio propio, se cambia en Vercel
// (variable NEXT_PUBLIC_SITE_URL) y todo lo demás (canonical, sitemap, hreflang) la sigue.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hometest-web.vercel.app").replace(/\/$/, "");

type SeoKey = keyof SiteCopy["seo"];

// Metadatos de cada página: título, descripción, canonical, versiones por idioma (hreflang)
// y tarjetas para compartir en redes (Open Graph / Twitter).
// La imagen se genera con scripts/make-og.py; si cambia, cambia también su nombre (OG_IMAGE): WhatsApp
// y compañía guardan la vista previa por dirección y seguirían enseñando la antigua.
const OG_IMAGE = `${SITE_URL}/images/kuova-og.jpg`;

export function pageMetadata(key: SeoKey, path: string): Metadata {
  const lang = getLang();
  const { seo, marca } = getContent(lang).siteCopy;
  const { title, description } = seo[key];
  // En pre-lanzamiento no hay direcciones /en: una sola URL por página
  const url = PRELAUNCH ? path : localePath(lang, path);
  return {
    title,
    description,
    alternates: PRELAUNCH
      ? { canonical: url }
      : { canonical: url, languages: { es: path, en: localePath("en", path), "x-default": path } },
    openGraph: {
      type: "website",
      siteName: marca.nombre,
      title,
      description,
      url,
      locale: lang === "en" ? "en_GB" : "es_ES",
      alternateLocale: lang === "en" ? "es_ES" : "en_GB",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Kuova Health — Know more. Live better.", type: "image/jpeg" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}

// --- Datos estructurados (schema.org, JSON-LD) para Google y buscadores con IA ---

export function organizationJsonLd(lang: Lang) {
  const { marca, pagina_contacto } = getContent(lang).siteCopy;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: marca.nombre,
        url: SITE_URL,
        description: marca.descripcion_corta,
        logo: `${SITE_URL}/icon.svg`,
        areaServed: { "@type": "Country", name: "Spain" },
        address: { "@type": "PostalAddress", addressLocality: "Madrid", addressCountry: "ES" },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: pagina_contacto.email_contacto,
          availableLanguage: ["es", "en"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: marca.nombre,
        inLanguage: ["es", "en"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

// Servicio que se ofrece (portada).
export function serviceJsonLd(lang: Lang) {
  const { siteCopy, panelTotal } = getContent(lang);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: siteCopy.seo.home.title,
    description: siteCopy.home.en_breve.parrafo,
    serviceType: lang === "en" ? "Preventive health membership with biomarker testing" : "Membresía de salud preventiva con análisis de biomarcadores",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "Spain" },
    url: `${SITE_URL}${localePath(lang, "/")}`,
    additionalProperty: [{ "@type": "PropertyValue", name: "biomarkers", value: panelTotal }],
  };
}

export function faqJsonLd(preguntas: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((p) => ({
      "@type": "Question",
      name: p.pregunta,
      acceptedAnswer: { "@type": "Answer", text: p.respuesta },
    })),
  };
}
