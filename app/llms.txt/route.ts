import { getContent } from "@/lib/content";
import { localePath } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";

// /llms.txt: resumen en texto plano para asistentes de IA (propuesta llmstxt.org).
// Se genera con los mismos textos de la web, así que nunca se queda desactualizado.
export const dynamic = "force-static";

export function GET() {
  const es = getContent("es");
  const en = getContent("en");
  const { marca, home } = en.siteCopy;
  const facts = home.en_breve.datos
    .map((d) => `- ${d.clave}: ${d.valor.replace("{n}", String(en.panelTotal)).replace("{s}", String(en.panel.length))}`)
    .join("\n");
  const faq = en.faq.preguntas.map((p) => `### ${p.pregunta}\n${p.respuesta}`).join("\n\n");
  const systems = en.panel.map((s) => `- ${s.nombre}: ${s.marcadores.map((m) => m.nombre).join(", ")}`).join("\n");
  const page = (path: string, title: string) =>
    `- [${title}](${SITE_URL}${localePath("en", path)}) · [ES](${SITE_URL}${path})`;

  const body = `# ${marca.nombre}

> ${home.en_breve.parrafo}

Spanish version: ${es.siteCopy.home.en_breve.parrafo}

## Key facts
${facts}

## Pages
${page("/", "Home")}
${page("/como-funciona", "How it works")}
${page("/catalogo", "Biomarker panel")}
${page("/faq", "FAQ")}
${page("/privacy", "Privacy policy")}
${page("/terms", "Terms of use")}

## Biomarker panel (${en.panelTotal} biomarkers, ${en.panel.length} body systems)
${systems}

## FAQ
${faq}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
