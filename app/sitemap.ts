import type { MetadataRoute } from "next";
import { localePath } from "@/lib/i18n";
import { getArticles, type Coleccion } from "@/lib/knowledge";
import { KNOWLEDGE, PRELAUNCH } from "@/lib/launch";
import { SITE_URL } from "@/lib/seo";

// Todas las páginas en los dos idiomas, cada una con su alternativa (hreflang). Las de la web
// antigua (RETIRADAS en lib/launch.ts) no van: redirigen a la portada.
const PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

// Textos largos ya publicados (los borradores no), solo en español: artículos de /conocimiento
// (cuando la sección está visible), comparativas y fichas de biomarcadores
function section(coleccion: Coleccion, priority: number): MetadataRoute.Sitemap {
  const published = getArticles(coleccion).filter((a) => a.estado === "publicado");
  if (!published.length) return [];
  return [
    { url: `${SITE_URL}/${coleccion}`, lastModified: new Date(), priority },
    ...published.map((a) => ({ url: `${SITE_URL}/${coleccion}/${a.slug}`, lastModified: new Date(a.revisado ?? a.fecha), priority })),
  ];
}
const knowledge = (): MetadataRoute.Sitemap => [
  ...(KNOWLEDGE ? section("conocimiento", 0.6) : []),
  ...section("biomarcadores", 0.7),
  ...section("comparativas", 0.5),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Pre-lanzamiento: solo la portada (una para los dos idiomas) y las páginas legales
  if (PRELAUNCH) {
    return [
      ...PAGES.map(({ path, priority }) => ({
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
