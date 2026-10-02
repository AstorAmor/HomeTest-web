import bloque1 from "@/content/biomarcadores/bloque-1-general.json";
import bloque2 from "@/content/biomarcadores/bloque-2-rendimiento.json";
import bloque3 from "@/content/biomarcadores/bloque-3-its.json";
import bloque5 from "@/content/biomarcadores/bloque-5-reproductiva.json";
import faqEs from "@/content/faq.json";
import faqEn from "@/content/en/faq.json";
import siteCopyEs from "@/content/site-copy.json";
import siteCopyEn from "@/content/en/site-copy.json";
import biomarcadoresEn from "@/content/en/biomarcadores.json";
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

export type SiteCopy = typeof siteCopyEs;

// Único punto de entrada a los bloques de biomarcadores (textos en español).
// Añadir un bloque nuevo aquí es lo único que hace falta tocar en código
// cuando se crea un archivo content/biomarcadores/bloque-X.json nuevo.
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

export function getContent(lang: Lang) {
  const isEn = lang === "en";
  const faq = (isEn ? faqEn : faqEs) as { preguntas: FaqItem[] };
  const bloques = isEn ? bloquesEn : bloquesEs;
  return {
    siteCopy: (isEn ? siteCopyEn : siteCopyEs) as SiteCopy,
    faq: { preguntas: faq.preguntas.filter((p) => !isPending(p.respuesta)) },
    bloquesBiomarcadores: bloques,
    totalBiomarcadores: bloques.reduce((total, b) => total + b.biomarcadores.length, 0),
  };
}

// Sustituye {n} en los textos de interfaz.
export const fill = (text: string, n: number) => text.replace("{n}", String(n));
