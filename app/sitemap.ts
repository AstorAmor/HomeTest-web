import type { MetadataRoute } from "next";
import { localePath } from "@/lib/i18n";
import { getArticles } from "@/lib/knowledge";
import { KNOWLEDGE, PRELAUNCH, PRELAUNCH_HIDDEN } from "@/lib/launch";
import { SITE_URL } from "@/lib/seo";

// Todas las páginas en los dos idiomas, cada una con su alternativa (hreflang).
const PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/como-funciona", priority: 0.8 },
  { path: "/catalogo", priority: 0.8 },
  { path: "/faq", priority: 0.7 },
  { path: "/contacto", priority: 0.4 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

// Artículos de /conocimiento ya publicados (los borradores no), solo en español
function knowledge(): MetadataRoute.Sitemap {
  if (!KNOWLEDGE) return [];
  const published = getArticles().filter((a) => a.estado === "publicado");
  if (!published.length) return [];
  return [
    { url: `${SITE_URL}/conocimiento`, lastModified: new Date(), priority: 0.6 },
    ...published.map((a) => ({ url: `${SITE_URL}/conocimiento/${a.slug}`, lastModified: new Date(a.fecha), priority: 0.6 })),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Pre-lanzamiento: solo la portada (una para los dos idiomas) y las páginas legales
  if (PRELAUNCH) {
    return [
      ...PAGES.filter(({ path }) => !PRELAUNCH_HIDDEN.includes(path)).map(({ path, priority }) => ({
        url: `${SITE_URL}${path}`,
        lastModified,
        priority,
      })),
      ...knowledge(),
    ];
  }
  return [...PAGES.flatMap(({ path, priority }) => {
    const languages = { es: `${SITE_URL}${path}`, en: `${SITE_URL}${localePath("en", path)}` };
    return (["es", "en"] as const).map((lang) => ({
      url: languages[lang],
      lastModified,
      priority: lang === "es" ? priority : priority * 0.9,
      alternates: { languages },
    }));
  }), ...knowledge()];
}
