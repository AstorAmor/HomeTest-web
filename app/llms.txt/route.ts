import { getContent } from "@/lib/content";
import { getArticles, hrefOf, leadOf, type Coleccion } from "@/lib/knowledge";
import { localePath } from "@/lib/i18n";
import { PRELAUNCH } from "@/lib/launch";
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
  // Las mismas preguntas que la portada (content/en/inicio.json), no las de la web antigua
  // Los enlaces relativos de las respuestas ([texto](/ruta)) se escriben con la dirección completa
  const abs = (t: string) => t.replace(/\]\(\//g, `](${SITE_URL}/`);
  const faq = en.inicio.preguntas.lista.map((p) => `### ${p.pregunta}\n${abs(p.respuesta)}`).join("\n\n");
  // Guías, fichas de biomarcadores y comparativas (en español), con su respuesta corta
  const section = (coleccion: Coleccion) =>
    getArticles(coleccion)
      .filter((a) => a.estado === "publicado")
      .map((a) => `- [${a.titulo}](${SITE_URL}${hrefOf(coleccion, a.slug)}): ${leadOf(a)}`)
      .join("\n");
  const page = (path: string, title: string) =>
    PRELAUNCH ? `- [${title}](${SITE_URL}${path})` : `- [${title}](${SITE_URL}${localePath("en", path)}) · [ES](${SITE_URL}${path})`;
  const pages = [
    page("/", PRELAUNCH ? "Home (pre-launch waitlist)" : "Home"),
    `- [Learn: index of all guides, biomarker sheets and comparisons (Spanish)](${SITE_URL}/aprende)`,
    page("/privacy", "Privacy policy"),
    page("/terms", "Terms of use"),
  ].join("\n");

  const body = `# ${marca.nombre}

> ${home.en_breve.parrafo}

Spanish version: ${es.siteCopy.home.en_breve.parrafo}

## Key facts
${facts}

## Focus
Preventive health and longevity (living more years in good health), based on lab tests, wearables and daily habits: diet, exercise, sleep and the menstrual cycle.

## Pages
${pages}

The full text of every guide, biomarker sheet and comparison is at ${SITE_URL}/llms-full.txt

## FAQ
${faq}

## Guides (Spanish, with cited sources): longevity, preventive health, biological age, blood tests, menstrual cycle, diet and exercise
${section("guias")}

## Biomarker guides (Spanish, with cited sources)
${section("biomarcadores")}

## Kuova compared with Apple Health, Google Health, Oura, Garmin, Huawei Health and WHOOP (Spanish)
${section("comparativas")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
