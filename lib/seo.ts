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

// Temas de los que sabe la empresa (para que buscadores y asistentes de IA la asocien con ellos)
const KNOWS_ABOUT = {
  es: ["Salud preventiva", "Longevidad", "Edad biológica", "Biomarcadores", "Análisis de sangre", "Wearables", "Ciclo menstrual", "Alimentación", "Ejercicio físico", "Sueño"],
  en: ["Preventive health", "Longevity", "Biological age", "Biomarkers", "Blood tests", "Wearables", "Menstrual cycle", "Nutrition", "Exercise", "Sleep"],
};

export function organizationJsonLd(lang: Lang) {
  const { marca, pagina_contacto, footer } = getContent(lang).siteCopy;
  // Solo los perfiles en redes que ya existen (los de "#" aún no están creados)
  const sameAs = footer.redes.map((r) => r.href).filter((h) => h.startsWith("http"));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: marca.nombre,
        url: SITE_URL,
        description: marca.descripcion_corta,
        slogan: lang === "en" ? "Know more. Live better." : "Conócete mejor. Vive mejor.",
        logo: `${SITE_URL}/icon.svg`,
        knowsAbout: KNOWS_ABOUT[lang],
        ...(sameAs.length ? { sameAs } : {}),
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
  const { siteCopy } = getContent(lang);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: siteCopy.seo.home.title,
    description: siteCopy.home.en_breve.parrafo,
    serviceType: lang === "en" ? "Preventive health membership with biomarker testing" : "Membresía de salud preventiva con análisis de biomarcadores",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "Spain" },
    url: `${SITE_URL}${localePath(lang, "/")}`,
  };
}

// Texto sin Markdown ([enlace](/ruta) → enlace, **negrita** → negrita) para los datos estructurados
const sinMarkdown = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");

export function faqJsonLd(preguntas: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((p) => ({
      "@type": "Question",
      name: p.pregunta,
      acceptedAnswer: { "@type": "Answer", text: sinMarkdown(p.respuesta) },
    })),
  };
}
