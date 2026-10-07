import type { MetadataRoute } from "next";
import { localePath } from "@/lib/i18n";
import { PRELAUNCH, PRELAUNCH_HIDDEN } from "@/lib/launch";
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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Pre-lanzamiento: solo la portada (una para los dos idiomas) y las páginas legales
  if (PRELAUNCH) {
    return PAGES.filter(({ path }) => !PRELAUNCH_HIDDEN.includes(path)).map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      priority,
    }));
  }
  return PAGES.flatMap(({ path, priority }) => {
    const languages = { es: `${SITE_URL}${path}`, en: `${SITE_URL}${localePath("en", path)}` };
    return (["es", "en"] as const).map((lang) => ({
      url: languages[lang],
      lastModified,
      priority: lang === "es" ? priority : priority * 0.9,
      alternates: { languages },
    }));
  });
}
