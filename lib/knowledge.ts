import fs from "node:fs";
import path from "node:path";
import { KNOWLEDGE } from "./launch";
import { parseRegla, reglaEnMarkdown, type Regla } from "./regla";

// Textos largos de la web, un archivo .md por página (el nombre del archivo es la dirección):
// - content/conocimiento/   → /conocimiento/<archivo>  (artículos)
// - content/comparativas/   → /comparativas/<archivo>  (Kuova frente a Apple Salud, Oura, Garmin...)
// - content/biomarcadores/  → /biomarcadores/<archivo> (una ficha por biomarcador)
// - content/guias/          → /<archivo>               (guías largas: longevidad, salud preventiva...,
//                                                       en la raíz para que la dirección sea corta)
// Markdown sencillo, sin librerías: ## y ### para títulos, - o 1. para listas, > para una frase
// destacada, | para tablas (la primera fila es la cabecera), **negrita**, *cursiva*,
// [texto](enlace), [^n] para citar la referencia n (definida al final con "[^n]: ..."),
// [[grafica:nombre]] en una línea para una gráfica y ![texto alternativo](/images/...) en una línea
// para una imagen (las líneas que la siguen en el mismo párrafo son su pie). En la cabecera,
// "imagen" e "imagen_alt" ponen una imagen grande arriba del texto, que también sale al compartir
// (o "imagen_og", si al compartir va otra). "## Etiqueta | Titular" pone una etiqueta pequeña sobre
// el titular.
// Los números de Kuova Letter (con "numero" en la cabecera) los escribe scripts/importar-numero.mjs
// desde la carpeta del número: no se editan a mano. Sus gráficos son los de kuova-graficos.js, como
// en el email: ![texto alternativo](kg:id), con el pie debajo y los datos en
// content/conocimiento/kuova-letter/<archivo>.json.
// En las fichas, el bloque "regla:" de la cabecera (líneas con sangría debajo) son los tramos de la
// regla de cifras, que se pinta donde el texto pone [[regla]] (lib/regla.ts). Una tabla con
// [[rangos]] en la línea de encima es de rangos por grupo (p. ej. mujeres y hombres) y se pinta con
// una barra por grupo (components/knowledge/Rangos.tsx).

export type Coleccion = "conocimiento" | "comparativas" | "biomarcadores" | "guias";

const DIRS: Record<Coleccion, string> = {
  conocimiento: path.join(process.cwd(), "content", "conocimiento"),
  comparativas: path.join(process.cwd(), "content", "comparativas"),
  biomarcadores: path.join(process.cwd(), "content", "biomarcadores"),
  guias: path.join(process.cwd(), "content", "guias"),
};

// Dirección de una página: las guías van en la raíz (/longevidad); el resto, dentro de su sección
export const hrefOf = (coleccion: Coleccion, slug: string) => (coleccion === "guias" ? `/${slug}` : `/${coleccion}/${slug}`);

export interface ArticleMeta {
  slug: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  categoria?: string;
  fecha: string;
  // Última vez que se comprobó el contenido con sus fuentes (YYYY-MM-DD)
  revisado?: string;
  lectura?: string;
  // Posición en el índice (menor primero); sin ella, por fecha
  orden?: number;
  // "borrador": se ve con un aviso y no se indexa en Google; "publicado": normal
  estado: "borrador" | "publicado";
  // Todo lo de la cabecera, por si una página necesita un campo propio (p. ej. "nombre_corto")
  meta: Record<string, string>;
}

export type Block =
  | { type: "h2" | "h3"; text: string; id: string; kicker?: string }
  | { type: "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; rangos?: boolean }
  | { type: "chart"; id: string }
  | { type: "regla" }
  | { type: "image"; src: string; alt: string; caption: string };

export interface Article extends ArticleMeta {
  blocks: Block[];
  refs: { id: string; text: string }[];
  // Regla de cifras de la ficha (bloque "regla:" de la cabecera), si la tiene
  regla?: Regla;
  // Gráficos de kuova-graficos.js de un número de Kuova Letter: id → gráfico y sus opciones
  graficos?: Record<string, { grafico: string; opciones: object }>;
}

// Orden de las familias en /biomarcadores (el campo "categoria" de cada ficha); las que no estén
// aquí van al final, en el orden en que aparecen
export const FAMILIAS = [
  "Hemograma",
  "Hierro y vitaminas",
  "Corazón y lípidos",
  "Metabolismo y azúcar",
  "Hígado",
  "Riñón",
  "Tiroides",
  "Inflamación",
];

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const cells = (line: string) =>
  line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

function parse(slug: string, raw: string): Article {
  const text = raw.replace(/\r\n/g, "\n");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  const meta: Record<string, string> = {};
  // Un campo sin valor ("regla:") abre un bloque: las líneas con sangría que le siguen son suyas
  const bloques: Record<string, string[]> = {};
  let bloque: string | null = null;
  for (const line of fm?.[1].split("\n") ?? []) {
    if (bloque && /^\s+\S/.test(line)) {
      bloques[bloque].push(line.trim());
      continue;
    }
    bloque = null;
    const i = line.indexOf(":");
    if (i <= 0) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (value) meta[key] = value;
    else bloques[(bloque = key)] = [];
  }
  const body = fm ? text.slice(fm[0].length) : text;

  const blocks: Block[] = [];
  const refs: Article["refs"] = [];
  for (const chunk of body.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const first = lines[0];
    const chart = first.match(/^\[\[grafica:([\w-]+)\]\]$/);
    const image = first.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (chart) blocks.push({ type: "chart", id: chart[1] });
    else if (first === "[[regla]]") blocks.push({ type: "regla" });
    else if (image) blocks.push({ type: "image", alt: image[1], src: image[2], caption: lines.slice(1).join(" ") });
    else if (first.startsWith("### ")) blocks.push({ type: "h3", text: first.slice(4), id: slugify(first.slice(4)) });
    else if (first.startsWith("## ")) {
      const [kicker, titular] = first.slice(3).split(/\s+\|\s+/);
      const text = titular ?? kicker;
      blocks.push({ type: "h2", text, id: slugify(text), ...(titular && { kicker }) });
    }
    else if (lines.every((l) => /^\[\^\w+\]:/.test(l)))
      for (const l of lines) {
        const m = l.match(/^\[\^(\w+)\]:\s*(.*)$/)!;
        refs.push({ id: m[1], text: m[2] });
      }
    else if (lines.every((l) => l.startsWith("|")) || (first === "[[rangos]]" && lines.slice(1).every((l) => l.startsWith("|")))) {
      const rangos = first === "[[rangos]]";
      // La fila de guiones (|---|---|) separa la cabecera y no se pinta
      const rows = lines.slice(rangos ? 1 : 0).filter((l) => !/^\|[\s:|-]+\|?$/.test(l)).map(cells);
      blocks.push({ type: "table", head: rows[0] ?? [], rows: rows.slice(1), ...(rangos && { rangos }) });
    } else if (lines.every((l) => l.startsWith("- "))) blocks.push({ type: "ul", items: lines.map((l) => l.slice(2)) });
    else if (lines.every((l) => /^\d+\.\s/.test(l))) blocks.push({ type: "ol", items: lines.map((l) => l.replace(/^\d+\.\s/, "")) });
    else if (lines.every((l) => l.startsWith(">"))) blocks.push({ type: "quote", text: lines.map((l) => l.replace(/^>\s?/, "")).join(" ") });
    else blocks.push({ type: "p", text: lines.join(" ") });
  }

  return {
    slug,
    titulo: meta.titulo ?? slug,
    subtitulo: meta.subtitulo ?? "",
    descripcion: meta.descripcion ?? meta.subtitulo ?? "",
    categoria: meta.categoria,
    fecha: meta.fecha ?? "",
    revisado: meta.revisado,
    lectura: meta.lectura,
    orden: meta.orden ? Number(meta.orden) : undefined,
    estado: meta.estado === "publicado" ? "publicado" : "borrador",
    meta,
    blocks,
    refs,
    regla: bloques.regla ? parseRegla(bloques.regla, meta.titulo ?? slug) : undefined,
  };
}

export function getArticles(coleccion: Coleccion = "conocimiento"): Article[] {
  const dir = DIRS[coleccion];
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
    .map((f) => {
      const a = parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(dir, f), "utf8"));
      const graficos = path.join(dir, "kuova-letter", `${a.slug}.json`);
      if (esNumero(a) && fs.existsSync(graficos)) a.graficos = JSON.parse(fs.readFileSync(graficos, "utf8"));
      return a;
    })
    .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999) || b.fecha.localeCompare(a.fecha));
}

// Un número de Kuova Letter (lo importa scripts/importar-numero.mjs, con "numero" en la cabecera)
export const esNumero = (a: ArticleMeta) => Boolean(a.meta.numero);

// ¿Existe esta página de /conocimiento? Los artículos, cuando la sección está encendida (KNOWLEDGE en
// lib/launch.ts), también en borrador, con su aviso. Los números de Kuova Letter van aparte, porque el
// botón de cada email lleva a su página: en kuovahealth.com solo existen publicados (cada uno con su
// OK), esté la sección encendida o no, y nunca en borrador; en local se ven también en borrador.
export const paginaVisible = (a: ArticleMeta) =>
  esNumero(a) ? a.estado === "publicado" || process.env.NODE_ENV !== "production" : KNOWLEDGE;

export function getArticle(slug: string, coleccion: Coleccion = "conocimiento"): Article | undefined {
  return getArticles(coleccion).find((a) => a.slug === slug);
}

// Texto sin Markdown, para datos estructurados y llms.txt
export const plain = (s: string) =>
  s
    .replace(/\[\^\w+\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

// Preguntas y respuestas de una página: cada ### que acaba en "?" con los párrafos y listas que le
// siguen hasta el siguiente título. Sirven para el FAQPage de Google y para llms.txt.
export function faqsOf(article: Article): { pregunta: string; respuesta: string }[] {
  const out: { pregunta: string; respuesta: string }[] = [];
  let cur: { pregunta: string; partes: string[] } | null = null;
  const close = () => {
    if (cur && cur.partes.length) out.push({ pregunta: plain(cur.pregunta), respuesta: plain(cur.partes.join(" ")) });
    cur = null;
  };
  for (const b of article.blocks) {
    if (b.type === "h2" || b.type === "h3") {
      close();
      if (b.type === "h3" && b.text.trim().endsWith("?")) cur = { pregunta: b.text, partes: [] };
    } else if (cur) {
      if (b.type === "p" || b.type === "quote") cur.partes.push(b.text);
      else if (b.type === "ul" || b.type === "ol") cur.partes.push(b.items.join("; ") + ".");
    }
  }
  close();
  return out;
}

// El primer párrafo: la respuesta corta que va arriba de cada página (y en llms.txt)
export const leadOf = (article: Article) => plain((article.blocks.find((b) => b.type === "p") as { text: string } | undefined)?.text ?? article.descripcion);

// Guías publicadas que enlazan a una dirección (p. ej. /biomarcadores/ferritina), para enlazar de vuelta
export const guiasQueEnlazan = (href: string) =>
  getArticles("guias").filter((g) => g.estado === "publicado" && JSON.stringify(g.blocks).includes(`](${href})`));

// El Markdown de una página tal cual (sin la cabecera) y con los enlaces internos como direcciones
// completas: para /llms-full.txt, donde los asistentes de IA leen el texto entero de cada página.
// La regla de cifras va como su tabla de tramos, y las tablas de rangos, como tablas normales.
export function markdownOf(coleccion: Coleccion, slug: string, base: string) {
  const raw = fs.readFileSync(path.join(DIRS[coleccion], `${slug}.md`), "utf8").replace(/\r\n/g, "\n");
  const regla = parse(slug, raw).regla;
  return raw
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^\[\[regla\]\]$/m, () => (regla ? reglaEnMarkdown(regla) : ""))
    .replace(/^\[\[rangos\]\]\n/gm, "")
    .replace(/\]\(\//g, `](${base}/`)
    .trim();
}
