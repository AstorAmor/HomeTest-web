// Regla de cifras («escribe tu cifra») de una ficha de biomarcador: los tramos de una guía, en la
// unidad del informe y, si los informes varían, en otra unidad. Los datos van en la cabecera de la
// ficha, en el bloque «regla:» (formato en content/README.md), y se pintan donde el texto pone
// [[regla]]: una barra con los tramos, un campo para escribir la cifra (que no sale del navegador)
// y la tabla de tramos, que va también en el HTML para Google, los asistentes de IA y sin JavaScript.
// Funciones puras, sin nada del servidor: las usan lib/knowledge.ts y components/knowledge/Regla.tsx.

export interface Tramo {
  // Desde qué cifra empieza (incluida), en la unidad principal; null = sin límite por abajo
  desde: number | null;
  // Lo mismo en la otra unidad: el de la guía si la cabecera lo da («126 = 7,0»), si no, calculado
  desdeOtra: number | null;
  etiqueta: string;
  texto: string;
}

export interface Regla {
  // Qué se mide, para la cabecera de la tabla («Glucosa en ayunas»)
  nombre: string;
  titulo: string;
  unidad: string;
  decimales: number;
  // Otra unidad en la que salen algunos informes: otra = cifra × factor + suma
  otra: { unidad: string; factor: number; suma: number; decimales: number; nota: string } | null;
  // Lo que abarca la barra, en la unidad principal
  extremos: [number, number];
  // Cifras con sentido en la unidad principal; fuera de ahí se pide revisar la unidad
  posible: [number, number] | null;
  // Tramo de referencia (desde 0): el tono de los demás depende de lo lejos que estén de él
  normal: number;
  tramos: Tramo[];
  mirar: string;
  ejemplo: string;
}

const num = (s?: string) => {
  if (s === undefined) return null;
  const t = s.replace(/\s/g, "").replace(",", ".");
  if (t === "" || t === "-") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const decimalesDe = (s?: string) => (s?.trim().match(/[.,](\d+)$/)?.[1].length ?? 0);

const par = (s?: string): [number, number] | null => {
  const [a, b] = (s ?? "").split("|").map((x) => num(x));
  return a !== null && a !== undefined && b !== null && b !== undefined ? [a, b] : null;
};

export const redondear = (n: number, dec: number) => Math.round(n * 10 ** dec) / 10 ** dec;

// Las líneas del bloque «regla:» de la cabecera (ya sin sangría), con «clave: valor»
export function parseRegla(lineas: string[], nombre: string): Regla | undefined {
  const campos: Record<string, string> = {};
  const crudos: { desde: string; otra?: string; etiqueta: string; texto: string }[] = [];
  for (const l of lineas) {
    const i = l.indexOf(":");
    if (i <= 0) continue;
    const clave = l.slice(0, i).trim();
    const valor = l.slice(i + 1).trim();
    if (clave === "tramo") {
      const [desde = "", etiqueta = "", ...texto] = valor.split("|").map((x) => x.trim());
      const [d, o] = desde.split("=").map((x) => x.trim());
      crudos.push({ desde: d, otra: o, etiqueta, texto: texto.join(" | ") });
    } else campos[clave] = valor;
  }
  const extremos = par(campos.extremos);
  if (!campos.unidad || !extremos || crudos.length < 2) return undefined;

  const [decP, decO] = (campos.decimales ?? "").split("|").map((x) => num(x));
  const decimales = decP ?? Math.max(...crudos.map((t) => decimalesDe(t.desde)));
  const factor = num(campos.factor);
  const otra =
    campos.otra_unidad && factor
      ? {
          unidad: campos.otra_unidad,
          factor,
          suma: num(campos.suma) ?? 0,
          decimales: decO ?? (crudos.some((t) => t.otra) ? Math.max(...crudos.map((t) => decimalesDe(t.otra))) : 1),
          nota: campos.equivalencia ?? "",
        }
      : null;

  const tramos = crudos.map((t) => {
    const desde = num(t.desde);
    const explicita = num(t.otra);
    return {
      desde,
      desdeOtra: explicita ?? (desde !== null && otra ? redondear(desde * otra.factor + otra.suma, otra.decimales) : null),
      etiqueta: t.etiqueta,
      texto: t.texto,
    };
  });

  return {
    nombre: campos.nombre ?? nombre,
    titulo: campos.titulo ?? "¿En qué tramo cae tu cifra?",
    unidad: campos.unidad,
    decimales,
    otra,
    extremos,
    posible: par(campos.posible),
    normal: Math.max(0, (num(campos.normal) ?? 1) - 1),
    tramos,
    mirar: campos.mirar ?? "",
    ejemplo: campos.ejemplo ?? "",
  };
}

// Cifra con coma decimal, como en los informes españoles
export const fmt = (n: number, dec: number) => n.toFixed(dec).replace(".", ",");

// Lo que escribe la persona: «110», «5,7», «5.7 %», «110 mg/dL»…
export function leerCifra(s: string): number | null {
  const m = s.match(/\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace(",", ".")) : null;
}

const desdeEn = (t: Tramo, otra: boolean) => (otra ? t.desdeOtra : t.desde);
const decEn = (r: Regla, otra: boolean) => (otra && r.otra ? r.otra.decimales : r.decimales);

export const aPrincipal = (r: Regla, v: number, otra: boolean) => (otra && r.otra ? (v - r.otra.suma) / r.otra.factor : v);
export const aOtra = (r: Regla, v: number) => (r.otra ? v * r.otra.factor + r.otra.suma : v);

// Tramo en el que cae una cifra, con los límites tal como se leen en la tabla de esa unidad
export function tramoDe(r: Regla, v: number, otra: boolean) {
  let i = 0;
  r.tramos.forEach((t, j) => {
    const d = desdeEn(t, otra);
    if (d !== null && v >= d - 1e-9) i = j;
  });
  return i;
}

// «Menos de 100», «De 100 a 125», «126 o más» (en la unidad que toque)
export function rangoTexto(r: Regla, i: number, otra: boolean) {
  const dec = decEn(r, otra);
  const paso = 1 / 10 ** dec;
  const d = desdeEn(r.tramos[i], otra);
  const sig = r.tramos[i + 1] ? desdeEn(r.tramos[i + 1], otra) : null;
  if (d === null && sig !== null) return `Menos de ${fmt(sig, dec)}`;
  if (d !== null && sig === null) return `${fmt(d, dec)} o más`;
  if (d !== null && sig !== null) return `De ${fmt(d, dec)} a ${fmt(sig - paso, dec)}`;
  return "";
}

// Posición (0-100 %) de una cifra en la barra, con la geometría de la unidad principal
export const posicion = (r: Regla, vPrincipal: number) =>
  Math.min(100, Math.max(0, ((vPrincipal - r.extremos[0]) / (r.extremos[1] - r.extremos[0])) * 100));

// Los tramos como tabla (Markdown en las celdas: negrita y citas)
export function tablaDe(r: Regla) {
  const head = [`${r.nombre} (${r.unidad})`, ...(r.otra ? [r.otra.unidad] : []), "Qué significa"];
  const rows = r.tramos.map((t, i) => [
    rangoTexto(r, i, false),
    ...(r.otra ? [rangoTexto(r, i, true)] : []),
    `**${t.etiqueta}.** ${t.texto}`,
  ]);
  return { head, rows };
}

// La misma tabla en Markdown, para /llms-full.txt
export function reglaEnMarkdown(r: Regla) {
  const { head, rows } = tablaDe(r);
  const linea = (c: string[]) => `| ${c.join(" | ")} |`;
  return [linea(head), linea(head.map(() => "---")), ...rows.map(linea)].join("\n") + (r.otra?.nota ? `\n\n${r.otra.nota}` : "");
}
