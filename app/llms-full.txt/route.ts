import { getContent } from "@/lib/content";
import { getArticles, hrefOf, markdownOf, type Coleccion } from "@/lib/knowledge";
import { SITE_URL } from "@/lib/seo";

// /llms-full.txt: el texto completo de las guías, las fichas de biomarcadores y las comparativas, en
// Markdown y con sus fuentes, para que los asistentes de IA puedan leerlo todo de una vez y citarlo.
// /llms.txt es el resumen con enlaces; este, el contenido entero. Se genera con los mismos archivos.
export const dynamic = "force-static";

const SECCIONES: { coleccion: Coleccion; titulo: string }[] = [
  { coleccion: "guias", titulo: "Guías" },
  { coleccion: "biomarcadores", titulo: "Fichas de biomarcadores" },
  { coleccion: "comparativas", titulo: "Comparativas con otras apps de salud" },
];

export function GET() {
  const { marca, home } = getContent("es").siteCopy;
  const paginas = SECCIONES.flatMap(({ coleccion, titulo }) =>
    getArticles(coleccion)
      .filter((a) => a.estado === "publicado")
      .map(
        (a) =>
          `# ${a.titulo}\n\nSección: ${titulo} · URL: ${SITE_URL}${hrefOf(coleccion, a.slug)} · Revisado: ${a.revisado ?? a.fecha}\n\n${markdownOf(coleccion, a.slug, SITE_URL)}`,
      ),
  );

  const body = `# ${marca.nombre}: guías, fichas de biomarcadores y comparativas (texto completo)

> ${home.en_breve.parrafo}

Resumen con enlaces: ${SITE_URL}/llms.txt · Índice para personas: ${SITE_URL}/aprende

${paginas.join("\n\n---\n\n")}
`;
  // Como /llms.txt: para los asistentes, fuera de los resultados de Google (repite las guías enteras)
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" } });
}
