import bloque1 from "@/content/biomarcadores/bloque-1-general.json";
import bloque2 from "@/content/biomarcadores/bloque-2-rendimiento.json";
import bloque3 from "@/content/biomarcadores/bloque-3-its.json";
import bloque5 from "@/content/biomarcadores/bloque-5-reproductiva.json";
import faqEs from "@/content/faq.json";
import faqEn from "@/content/en/faq.json";
import siteCopyEs from "@/content/site-copy.json";
import siteCopyEn from "@/content/en/site-copy.json";
import biomarcadoresEn from "@/content/en/biomarcadores.json";
import panelData from "@/content/panel.json";
import type { Lang } from "@/lib/i18n";

export interface Biomarcador {
  id: string;
  nombre: string;
  muestra: string;
  explicacion: string;
  categoria_bloque: string;
}

export interface BloqueBiomarcadores {
  bloque_id: string;
  titulo: string;
  descripcion: string;
  biomarcadores: Biomarcador[];
}

export interface FaqItem {
  id: string;
  pregunta: string;
  respuesta: string;
}

// Panel de laboratorio (generado desde la app con scripts/sync-panel.mjs), ya en un idioma.
export interface PanelSystem {
  id: string;
  nombre: string;
  marcadores: { id: string; nombre: string; muestra: string }[];
}

export type SiteCopy = typeof siteCopyEs;

// Packs por objetivo (textos en español). Añadir un bloque nuevo aquí es lo único que hace
// falta tocar en código cuando se crea un archivo content/biomarcadores/bloque-X.json nuevo.
// La versión inglesa sale de content/en/biomarcadores.json (por id).
const bloquesEs: BloqueBiomarcadores[] = [bloque1, bloque2, bloque3, bloque5];

// Los textos marcados como pendientes no se publican (ni explicaciones ni respuestas de FAQ).
export const isPending = (text: string) => text.includes("PENDIENTE");

const en = biomarcadoresEn as {
  bloques: Record<string, { titulo: string; descripcion: string }>;
  nombres: Record<string, string>;
  muestras: Record<string, string>;
};

const bloquesEn: BloqueBiomarcadores[] = bloquesEs.map((b) => ({
  ...b,
  titulo: en.bloques[b.bloque_id]?.titulo ?? b.titulo,
  descripcion: en.bloques[b.bloque_id]?.descripcion ?? b.descripcion,
  biomarcadores: b.biomarcadores.map((m) => ({
    ...m,
    nombre: en.nombres[m.id] ?? m.nombre,
    muestra: en.muestras[m.muestra] ?? m.muestra,
  })),
}));

const panelFor = (lang: Lang): PanelSystem[] =>
  panelData.systems.map((s) => ({
    id: s.id,
    nombre: s[lang],
    marcadores: s.markers.map((m) => ({ id: m.id, nombre: m[lang], muestra: m.sample[lang] })),
  }));

export function getContent(lang: Lang) {
  const isEn = lang === "en";
  const faq = (isEn ? faqEn : faqEs) as { preguntas: FaqItem[] };
  const bloques = isEn ? bloquesEn : bloquesEs;
  const panel = panelFor(lang);
  return {
    lang,
    siteCopy: (isEn ? siteCopyEn : siteCopyEs) as SiteCopy,
    faq: { preguntas: faq.preguntas.filter((p) => !isPending(p.respuesta)) },
    bloquesBiomarcadores: bloques,
    panel,
    panelTotal: panelData.total,
  };
}

// Sustituye {n} (y {s}) en los textos de interfaz.
export const fill = (text: string, n: number, s?: number) =>
  text.replace("{n}", String(n)).replace("{s}", String(s ?? ""));
