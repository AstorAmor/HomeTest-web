import bloque1 from "@/content/biomarcadores/bloque-1-general.json";
import bloque2 from "@/content/biomarcadores/bloque-2-rendimiento.json";
import bloque3 from "@/content/biomarcadores/bloque-3-its.json";
import bloque5 from "@/content/biomarcadores/bloque-5-reproductiva.json";
import faqData from "@/content/faq.json";
import siteCopyData from "@/content/site-copy.json";

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

// Único punto de entrada a los bloques de biomarcadores.
// Añadir un bloque nuevo aquí es lo único que hace falta tocar en código
// cuando se crea un archivo content/biomarcadores/bloque-X.json nuevo.
export const bloquesBiomarcadores: BloqueBiomarcadores[] = [
  bloque1,
  bloque2,
  bloque3,
  bloque5,
];

export function getTotalBiomarcadores(): number {
  return bloquesBiomarcadores.reduce(
    (total, bloque) => total + bloque.biomarcadores.length,
    0
  );
}

export const faq: { preguntas: FaqItem[] } = faqData;

export const siteCopy = siteCopyData;
