import fs from "node:fs";
import path from "node:path";

// Artículos de /conocimiento: un archivo .md por artículo en content/conocimiento/ (el nombre del
// archivo es la dirección: medir-biomarcadores.md → /conocimiento/medir-biomarcadores).
// Markdown sencillo, sin librerías: ## y ### para títulos, - o 1. para listas, > para una fórmula
// destacada, **negrita**, *cursiva*, [texto](enlace), [^n] para citar la referencia n
// (definida al final con "[^n]: ...") y [[grafica:nombre]] en una línea para una gráfica.

const DIR = path.join(process.cwd(), "content", "conocimiento");

export interface ArticleMeta {
  slug: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  categoria?: string;
  fecha: string;
  lectura?: string;
  // "borrador": se ve con un aviso y no se indexa en Google; "publicado": normal
  estado: "borrador" | "publicado";
}

export type Block =
  | { type: "h2" | "h3"; text: string; id: string }
  | { type: "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
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
    else if (lines.every((l) => l.startsWith("- "))) blocks.push({ type: "ul", items: lines.map((l) => l.slice(2)) });
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
    lectura: meta.lectura,
    estado: meta.estado === "publicado" ? "publicado" : "borrador",
    blocks,
    refs,
  };
}

export function getArticles(): Article[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
    .map((f) => parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}
