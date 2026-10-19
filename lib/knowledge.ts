import fs from "node:fs";
import path from "node:path";

// Textos largos de la web, un archivo .md por página (el nombre del archivo es la dirección):
// - content/conocimiento/   → /conocimiento/<archivo>  (artículos)
// - content/comparativas/   → /comparativas/<archivo>  (Kuova frente a Apple Salud, Oura, Garmin...)
// - content/biomarcadores/  → /biomarcadores/<archivo> (una ficha por biomarcador)
// Markdown sencillo, sin librerías: ## y ### para títulos, - o 1. para listas, > para una frase
// destacada, | para tablas (la primera fila es la cabecera), **negrita**, *cursiva*,
// [texto](enlace), [^n] para citar la referencia n (definida al final con "[^n]: ...") y
// [[grafica:nombre]] en una línea para una gráfica.

export type Coleccion = "conocimiento" | "comparativas" | "biomarcadores";

const DIRS: Record<Coleccion, string> = {
  conocimiento: path.join(process.cwd(), "content", "conocimiento"),
  comparativas: path.join(process.cwd(), "content", "comparativas"),
  biomarcadores: path.join(process.cwd(), "content", "biomarcadores"),
};

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
  | { type: "h2" | "h3"; text: string; id: string }
  | { type: "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "chart"; id: string };

export interface Article extends ArticleMeta {
  blocks: Block[];
  refs: { id: string; text: string }[];
}

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
  for (const line of fm?.[1].split("\n") ?? []) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const body = fm ? text.slice(fm[0].length) : text;

  const blocks: Block[] = [];
  const refs: Article["refs"] = [];
  for (const chunk of body.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const first = lines[0];
    const chart = first.match(/^\[\[grafica:([\w-]+)\]\]$/);
    if (chart) blocks.push({ type: "chart", id: chart[1] });
    else if (first.startsWith("### ")) blocks.push({ type: "h3", text: first.slice(4), id: slugify(first.slice(4)) });
    else if (first.startsWith("## ")) blocks.push({ type: "h2", text: first.slice(3), id: slugify(first.slice(3)) });
    else if (lines.every((l) => /^\[\^\w+\]:/.test(l)))
      for (const l of lines) {
        const m = l.match(/^\[\^(\w+)\]:\s*(.*)$/)!;
        refs.push({ id: m[1], text: m[2] });
      }
    else if (lines.every((l) => l.startsWith("|"))) {
      // La fila de guiones (|---|---|) separa la cabecera y no se pinta
      const rows = lines.filter((l) => !/^\|[\s:|-]+\|?$/.test(l)).map(cells);
      blocks.push({ type: "table", head: rows[0] ?? [], rows: rows.slice(1) });
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
  };
}

export function getArticles(coleccion: Coleccion = "conocimiento"): Article[] {
  const dir = DIRS[coleccion];
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
    .map((f) => parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999) || b.fecha.localeCompare(a.fecha));
}

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
