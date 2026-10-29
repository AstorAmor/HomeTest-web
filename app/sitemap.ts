import type { MetadataRoute } from "next";
import inicioEn from "@/content/en/inicio.json";
import inicioEs from "@/content/inicio.json";
import { privacyEn, privacyEs, termsEn, termsEs } from "@/content/legal";
import { localePath } from "@/lib/i18n";
import { esNumero, getArticles, hrefOf, type Coleccion } from "@/lib/knowledge";
import { KNOWLEDGE, NEWSLETTER, PRELAUNCH } from "@/lib/launch";
import { SITE_URL } from "@/lib/seo";

// Todas las páginas en los dos idiomas, cada una con su alternativa (hreflang). Las de la web
// antigua (RETIRADAS en lib/launch.ts) no van: redirigen a la portada.
//
// «lastModified» es siempre la fecha real del último cambio de contenido, nunca la hora del build:
// Google solo tiene en cuenta lastmod si es fiable, y si se mueve sin cambios deja de usarlo en toda
// la web. Portada: el campo «actualizado» de content/inicio.json (y del inglés). Legales: su
// «Última actualización» en content/legal.ts. Guías, fichas y comparativas: su «revisado» (o
// «fecha»). Índices: la página más reciente de las que listan. Si no hay una fecha fiable, no se pone.

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// «Última actualización: 22 de octubre de 2026» o «Last updated: 22 October 2026»
function fechaDeTexto(texto: string): Date | undefined {
  const es = texto.match(/(\d{1,2}) de ([a-záéíóú]+) de (\d{4})/i);
  if (es && MESES.includes(es[2].toLowerCase())) return new Date(Date.UTC(+es[3], MESES.indexOf(es[2].toLowerCase()), +es[1]));
  const en = Date.parse(`${texto.replace(/^[^:]*:\s*/, "")} UTC`);
  return Number.isNaN(en) ? undefined : new Date(en);
}

const dia = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00Z`) : undefined);

const PAGES: { path: string; priority: number; fecha: { es?: Date; en?: Date } }[] = [
  { path: "/", priority: 1, fecha: { es: dia(inicioEs.actualizado), en: dia(inicioEn.actualizado) } },
  { path: "/privacy", priority: 0.2, fecha: { es: fechaDeTexto(privacyEs.updated), en: fechaDeTexto(privacyEn.updated) } },
  { path: "/terms", priority: 0.2, fecha: { es: fechaDeTexto(termsEs.updated), en: fechaDeTexto(termsEn.updated) } },
];

const publicadas = (coleccion: Coleccion) => getArticles(coleccion).filter((a) => a.estado === "publicado");
const fechaDe = (a: { revisado?: string; fecha: string }) => a.revisado ?? a.fecha;
// La fecha más reciente de un grupo de páginas (para su índice)
const masReciente = (...colecciones: Coleccion[]) => dia(colecciones.flatMap((c) => publicadas(c).map(fechaDe)).sort().pop());

// Textos largos ya publicados (los borradores no), solo en español: artículos de /conocimiento
// (cuando la sección está visible), guías (en la raíz, con /aprende como índice), comparativas y
// fichas de biomarcadores
function section(coleccion: Coleccion, priority: number): MetadataRoute.Sitemap {
  const published = publicadas(coleccion);
  if (!published.length) return [];
  // /aprende lista las guías, las fichas y las comparativas; los demás índices, solo lo suyo
  const indice = coleccion === "guias" ? masReciente("guias", "biomarcadores", "comparativas") : masReciente(coleccion);
  return [
    { url: `${SITE_URL}/${coleccion === "guias" ? "aprende" : coleccion}`, lastModified: indice, priority },
    ...published.map((a) => ({ url: `${SITE_URL}${hrefOf(coleccion, a.slug)}`, lastModified: dia(fechaDe(a)), priority })),
  ];
}
const knowledge = (): MetadataRoute.Sitemap => [
  ...section("guias", 0.8),
  // La página de Kuova Letter, solo en español y con la newsletter activa. Sin fecha: sus textos no
  // llevan una (mejor ninguna que la del build)
  ...(NEWSLETTER ? [{ url: `${SITE_URL}/newsletter`, priority: 0.5 }] : []),
  // Con /conocimiento apagado, los números publicados de Kuova Letter siguen en la web (el email
  // enlaza a ellos: paginaVisible en lib/knowledge.ts), así que van sin el índice
  ...(KNOWLEDGE
    ? section("conocimiento", 0.6)
    : publicadas("conocimiento")
        .filter(esNumero)
        .map((a) => ({ url: `${SITE_URL}${hrefOf("conocimiento", a.slug)}`, lastModified: dia(fechaDe(a)), priority: 0.6 }))),
  ...section("biomarcadores", 0.7),
  ...section("comparativas", 0.5),
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Pre-lanzamiento: solo la portada (una para los dos idiomas) y las páginas legales
  if (PRELAUNCH) {
    return [
      ...PAGES.map(({ path, priority, fecha }) => ({
        url: `${SITE_URL}${path}`,
        lastModified: fecha.es,
        priority,
      })),
      ...knowledge(),
    ];
  }
  return [
    ...PAGES.flatMap(({ path, priority, fecha }) => {
      const languages = { es: `${SITE_URL}${path}`, en: `${SITE_URL}${localePath("en", path)}` };
      return (["es", "en"] as const).map((lang) => ({
        url: languages[lang],
        lastModified: fecha[lang],
        priority: lang === "es" ? priority : priority * 0.9,
        alternates: { languages },
      }));
    }),
    ...knowledge(),
  ];
}
