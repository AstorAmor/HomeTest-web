// Importa un número de Kuova Letter a la web: /conocimiento/<slug>, la «versión web» a la que lleva el
// botón «Ver los gráficos interactivos» del email. Lee la carpeta del número en OneDrive (la fuente:
// el texto nunca se copia a mano) y escribe lo que la web necesita:
//   content/conocimiento/<slug>.md               el texto, en el Markdown de la web (lib/knowledge.ts)
//   content/conocimiento/kuova-letter/<slug>.json los gráficos del número y sus datos (de datos.json)
//   public/images/kuova-letter/<slug>/           la portada (portada.svg y/o imagenes/portada.png)
//   public/kuova-letter/kuova-graficos.js        los gráficos, el mismo archivo que el email y la vista previa
//
// Uso (desde la carpeta de la web):
//   node scripts/importar-numero.mjs "<carpeta del número>"              → borrador: solo se ve en local
//   node scripts/importar-numero.mjs "<carpeta del número>" --publicar   → publicado (solo con el OK de Astor a ESE número)
//   … --fecha 2026-11-17     fecha de envío, si no es la de «enviar:» en texto.md (o si allí no hay)
// Ejemplo: node scripts/importar-numero.mjs "C:/Users/Astor/OneDrive/2. Entrepreneurship/05 Marca/Newsletter/002 Noviembre cansa"
//
// Un número en borrador no existe en kuovahealth.com, ni con /conocimiento encendido (lib/knowledge.ts,
// paginaVisible). Despublicar: volver a importarlo sin --publicar, commit y push. Cada cambio en
// texto.md se trae volviendo a importar (con --publicar si ya estaba publicado).
//
// Traducción de texto.md (formato en Newsletter/Herramientas/GUIA_NUMEROS.md; la misma que hace
// construir_numero.py para la vista previa): «## El tema» es el comienzo del texto (su titular es el
// título de la página); «## Etiqueta | Titular» se queda igual; «::grafico id | alt | pie» pasa a
// «![alt](kg:id)» con el pie debajo; «::web id | frase» pinta la calculadora (la frase solo va en el
// email, que invita a la versión web: aquí la calculadora ya está); las citas [1] o [2, 3] pasan a [^1] o [^2][^3]; «## Fuentes» pasa a
// notas [^n] con sus direcciones enlazadas; los enlaces a kuovahealth.com quedan como rutas de la web.

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opcion = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const carpetaArg = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--fecha");
const publicar = args.includes("--publicar");
const fechaArg = opcion("--fecha");

const fallo = (msg) => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};
if (!carpetaArg) fallo('Falta la carpeta del número: node scripts/importar-numero.mjs "<carpeta>" [--publicar] [--fecha AAAA-MM-DD]');
if (fechaArg && !/^\d{4}-\d{2}-\d{2}$/.test(fechaArg)) fallo("--fecha va como AAAA-MM-DD (p. ej. 2026-11-17)");

const CARPETA = resolve(carpetaArg);
const HERRAMIENTAS = join(CARPETA, "..", "Herramientas");
const JS = join(HERRAMIENTAS, "kuova-graficos.js");
if (!existsSync(join(CARPETA, "texto.md"))) fallo(`No hay texto.md en ${CARPETA}`);
if (!existsSync(JS)) fallo(`No encuentro kuova-graficos.js en ${HERRAMIENTAS}`);
const avisos = [];

// ---------------------------------------------------------------- lectura (como leer() y bloques() de construir_numero.py)

const raw = readFileSync(join(CARPETA, "texto.md"), "utf8").replace(/\r\n/g, "\n");
const fm = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!fm) fallo("texto.md sin cabecera ---");
const meta = {};
for (const linea of fm[1].split("\n")) {
  const i = linea.indexOf(":");
  if (i > 0) meta[linea.slice(0, i).trim()] = linea.slice(i + 1).trim();
}
for (const k of ["numero", "slug", "titulo", "preheader", "ilustracion"]) if (!meta[k]) fallo(`texto.md: falta «${k}» en la cabecera`);
const SLUG = meta.slug;
if (!/^[a-z0-9-]+$/.test(SLUG)) fallo(`slug «${SLUG}»: solo minúsculas, números y guiones`);
if (meta.cta_url && !meta.cta_url.endsWith(`/conocimiento/${SLUG}`)) avisos.push(`cta_url (${meta.cta_url}) no acaba en /conocimiento/${SLUG}: el botón del email no llevará a esta página`);

function bloques(cuerpo) {
  const out = [];
  let lista = null;
  let parrafo = [];
  const cerrar = () => {
    if (parrafo.length) out.push(["p", parrafo.join(" ")]);
    parrafo = [];
    if (lista) out.push(["ul", lista]);
    lista = null;
  };
  for (const linea of cuerpo.split("\n")) {
    const l = linea.trim();
    if (!l || l.startsWith("<!--")) cerrar();
    else if (l.startsWith("### ")) (cerrar(), out.push(["h3", l.slice(4)]));
    else if (l.startsWith("::")) {
      cerrar();
      const [tipo, ...resto] = l.slice(2).split(" ");
      out.push([tipo, resto.join(" ").split("|").map((x) => x.trim())]);
    } else if (/^\d+\.\s/.test(l)) (cerrar(), out.push(["ref", l.replace(/^\d+\.\s/, "")]));
    else if (l.startsWith("- ")) {
      if (parrafo.length) out.push(["p", parrafo.join(" ")]);
      parrafo = [];
      lista = [...(lista ?? []), l.slice(2)];
    } else {
      if (lista) (out.push(["ul", lista]), (lista = null));
      parrafo.push(l);
    }
  }
  cerrar();
  return out;
}

const secciones = fm[2]
  .split(/^## /m)
  .slice(1)
  .map((bloque) => {
    const [cab, ...cuerpo] = bloque.split("\n");
    const [etiqueta, titular = ""] = cab.split("|").map((x) => x.trim());
    return { etiqueta, titular, bloques: bloques(cuerpo.join("\n")) };
  });
if (secciones[0]?.etiqueta !== "El tema") fallo("texto.md: la primera sección tiene que ser «## El tema»");

// ---------------------------------------------------------------- gráficos (como opciones_grafico() de construir_numero.py)

const codigo = readFileSync(JS, "utf8");
const mapa = codigo.match(/const MAPA = \{([\s\S]*?)\};/);
if (!mapa) fallo("kuova-graficos.js: no encuentro «const MAPA = {…}» (la lista de gráficos)");
const DISPONIBLES = new Set([...mapa[1].matchAll(/(\w+):/g)].map((m) => m[1]));
const GRAFICOS = new Set([...DISPONIBLES].filter((n) => !n.startsWith("ilus")));

const datos = existsSync(join(CARPETA, "datos.json")) ? JSON.parse(readFileSync(join(CARPETA, "datos.json"), "utf8")) : {};
const graficos = {};
function grafico(gid) {
  const [nombre, variante] = gid.split(/:(.*)/s);
  const opciones = variante ? Object.fromEntries(variante.split(",").map((x) => x.split(/=(.*)/s).slice(0, 2))) : {};
  const d = datos[nombre];
  if (GRAFICOS.has(nombre)) graficos[gid] = { grafico: nombre, opciones: d ? { ...opciones, datos: d } : opciones };
  else if (d && GRAFICOS.has(d.tipo)) graficos[gid] = { grafico: d.tipo, opciones: { ...opciones, datos: d } };
  else fallo(`el gráfico «${nombre}» no existe en kuova-graficos.js ni está en datos.json con un «tipo» válido (${[...GRAFICOS].join(", ")})`);
  return gid;
}

// ---------------------------------------------------------------- texto en el Markdown de la web

const fuentes = secciones.find((s) => s.etiqueta === "Fuentes")?.bloques.filter(([t]) => t === "ref").map(([, v]) => v) ?? [];
const citadas = new Set();

// Citas [1], [2, 3] o [4–6] → [^1], [^2][^3], [^4][^5][^6], pegadas a la palabra (como en el resto de la web)
function citas(t) {
  return t.replace(/\s*\[(\d+(?:\s*[,–-]\s*\d+)*)\]/g, (_, lista) => {
    const ns = [];
    for (const parte of lista.split(/\s*,\s*/)) {
      const [a, b = a] = parte.split(/\s*[–-]\s*/).map(Number);
      for (let n = a; n <= b; n++) ns.push(n);
    }
    for (const n of ns) {
      if (n < 1 || n > fuentes.length) fallo(`la cita [${n}] no tiene fuente en «## Fuentes» (hay ${fuentes.length})`);
      citadas.add(n);
    }
    return ns.map((n) => `[^${n}]`).join("");
  });
}
// Enlaces a la propia web como rutas (/#lista-de-espera): se abren en la misma pestaña y funcionan en local
const enlaces = (t) => t.replace(/\]\(https:\/\/(?:www\.)?kuovahealth\.com(\/[^)\s]*)?\)/g, (_, ruta) => `](${ruta || "/"})`);
const texto = (t) => enlaces(citas(t));

// Direcciones sueltas de las fuentes → enlace (doi:… para los DOI); los paréntesis de la dirección van
// codificados para que el Markdown de la web no corte el enlace
function fuente(t) {
  return t.replace(/(https?:\/\/[^\s<]+[^\s<.,;)])/g, (url) => {
    const href = url.replace(/\(/g, "%28").replace(/\)/g, "%29");
    const doi = url.match(/^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/);
    return `[${doi ? `doi:${doi[1]}` : url.replace(/^https?:\/\/(www\.)?/, "")}](${href})`;
  });
}

function md(bs) {
  const out = [];
  for (const [tipo, v] of bs) {
    if (tipo === "p") out.push(texto(v));
    else if (tipo === "h3") out.push(`### ${v}`);
    else if (tipo === "ul") out.push(v.map((x) => `- ${texto(x)}`).join("\n"));
    else if (tipo === "grafico") {
      const [gid, alt = "", pie = ""] = v;
      out.push(`![${alt}](kg:${grafico(gid)})` + (pie ? `\n${texto(pie)}` : ""));
    } else if (tipo === "web") {
      out.push(`![](kg:${grafico(v[0])})`);
    } else if (tipo === "ref") fallo(`línea numerada fuera de «## Fuentes»: «${v.slice(0, 60)}…» (el formato la toma por una fuente)`);
    else fallo(`bloque «::${tipo}» desconocido (solo ::grafico y ::web)`);
  }
  for (const b of out) if (/^!\[[^\]]*\][^(]/.test(b)) fallo(`el texto alternativo de un gráfico no puede llevar «]»: ${b.slice(0, 80)}…`);
  return out;
}

const partes = [];
for (const s of secciones) {
  if (s.etiqueta === "Fuentes") continue;
  if (s.etiqueta !== "El tema") partes.push(`## ${s.etiqueta}${s.titular ? ` | ${s.titular}` : ""}`);
  partes.push(...md(s.bloques));
}
fuentes.forEach((f, i) => {
  if (!citadas.has(i + 1)) avisos.push(`la fuente ${i + 1} no se cita en el texto (se lista igual): ${f.slice(0, 70)}…`);
});
const notas = fuentes.map((f, i) => `[^${i + 1}]: ${fuente(f)}`).join("\n");

// Palabras sin las fuentes, como palabras() de construir_numero.py (≈ 230 por minuto)
const contar = (t) => t.replace(/\[\d[^\]]*\]/g, "").split(/\s+/).filter(Boolean).length;
let palabras = contar(meta.titulo);
for (const s of secciones) {
  if (s.etiqueta === "Fuentes") continue;
  palabras += contar(s.titular);
  for (const [tipo, v] of s.bloques) palabras += tipo === "p" || tipo === "h3" ? contar(v) : tipo === "ul" ? v.reduce((n, x) => n + contar(x), 0) : 0;
}

// ---------------------------------------------------------------- fecha, portada y cabecera

const enviar = (meta.enviar ?? "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
const fecha = fechaArg ?? (enviar ? `${enviar[3]}-${enviar[2].padStart(2, "0")}-${enviar[1].padStart(2, "0")}` : "");
if (!fecha) {
  if (publicar) fallo(`«enviar: ${meta.enviar ?? ""}» no tiene fecha: pon la de envío con --fecha AAAA-MM-DD`);
  avisos.push(`«enviar: ${meta.enviar ?? ""}» no tiene fecha; al publicar, pon la de envío con --fecha AAAA-MM-DD`);
}

const IMG = join(WEB, "public", "images", "kuova-letter", SLUG);
rmSync(IMG, { recursive: true, force: true });
mkdirSync(IMG, { recursive: true });
const ruta = (archivo) => `/images/kuova-letter/${SLUG}/${archivo}`;
const png = join(CARPETA, "imagenes", "portada.png");
let imagen = "";
let imagenOg = "";
if (existsSync(png)) {
  copyFileSync(png, join(IMG, "portada.png"));
  imagen = imagenOg = ruta("portada.png");
} else avisos.push("no hay imagenes/portada.png (se genera con construir_numero.py --png): al compartir saldrá la imagen genérica de Kuova");
if (meta.ilustracion.endsWith(".svg")) {
  if (!existsSync(join(CARPETA, meta.ilustracion))) fallo(`ilustracion: no existe ${meta.ilustracion} en la carpeta`);
  copyFileSync(join(CARPETA, meta.ilustracion), join(IMG, "portada.svg"));
  imagen = ruta("portada.svg");
} else if (!DISPONIBLES.has(meta.ilustracion)) fallo(`ilustracion «${meta.ilustracion}»: ni es un .svg ni está en kuova-graficos.js`);
else if (!imagen) fallo(`la ilustración «${meta.ilustracion}» se pinta con kuova-graficos.js y la web usa su PNG: falta imagenes/portada.png`);

const hoy = new Date().toISOString().slice(0, 10);
const descripcion = meta.preheader.replace(/^Kuova Letter n\.º\s*\d+\s*·\s*/, "");
const cabecera = {
  titulo: meta.titulo,
  subtitulo: descripcion,
  descripcion,
  categoria: "Kuova Letter",
  numero: meta.numero,
  mes: meta.mes,
  fecha,
  lectura: `${Math.max(1, Math.round(palabras / 230))} min`,
  estado: publicar ? "publicado" : "borrador",
  imagen,
  imagen_alt: meta.ilustracion_alt,
  imagen_og: imagenOg,
  origen: `Newsletter/${basename(CARPETA)}/texto.md (${meta.estado ?? "sin estado"}), importado el ${hoy} con scripts/importar-numero.mjs. No editar a mano: se sobrescribe al volver a importar`,
};
for (const [k, v] of Object.entries(cabecera)) if (/\n/.test(v ?? "")) fallo(`«${k}» tiene saltos de línea`);

// ---------------------------------------------------------------- escritura

const articulo = `---\n${Object.entries(cabecera)
  .filter(([, v]) => v)
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n")}\n---\n\n${partes.join("\n\n")}\n\n${notas}\n`;
writeFileSync(join(WEB, "content", "conocimiento", `${SLUG}.md`), articulo);
mkdirSync(join(WEB, "content", "conocimiento", "kuova-letter"), { recursive: true });
writeFileSync(join(WEB, "content", "conocimiento", "kuova-letter", `${SLUG}.json`), JSON.stringify(graficos, null, 2) + "\n");

// kuova-graficos.js es uno para todos los números: si ha cambiado, cambian también los ya publicados
const DESTINO_JS = join(WEB, "public", "kuova-letter", "kuova-graficos.js");
const huella = (f) => (existsSync(f) ? createHash("sha256").update(readFileSync(f)).digest("hex") : "");
const jsCambia = huella(DESTINO_JS) !== huella(JS);
if (jsCambia) {
  mkdirSync(dirname(DESTINO_JS), { recursive: true });
  copyFileSync(JS, DESTINO_JS);
}

console.log(`\nKuova Letter n.º ${meta.numero} · «${meta.titulo}» → /conocimiento/${SLUG} (${cabecera.estado})`);
console.log(`  content/conocimiento/${SLUG}.md · ${palabras} palabras · ${fuentes.length} fuentes · fecha ${fecha || "(sin fecha)"}`);
console.log(`  content/conocimiento/kuova-letter/${SLUG}.json · ${Object.keys(graficos).length} gráficos: ${Object.keys(graficos).join(", ")}`);
console.log(`  public/images/kuova-letter/${SLUG}/ · ${[imagen, imagenOg].filter(Boolean).map((r) => basename(r)).filter((x, i, a) => a.indexOf(x) === i).join(" y ")}`);
if (jsCambia) console.log("  public/kuova-letter/kuova-graficos.js actualizado: revisa también los números ya publicados");
for (const a of avisos) console.log(`  ! ${a}`);
if (publicar) {
  if (/borrador/i.test(meta.estado ?? "")) console.log(`  ! texto.md sigue como «${meta.estado}»: publica solo si Astor ha dado el OK a este número`);
  console.log("\nPublicado en el repositorio: se verá en kuovahealth.com después del commit y el push (con el OK de Astor).");
} else console.log(`\nBorrador: solo se ve en local (npm run dev → http://localhost:3000/conocimiento/${SLUG}).`);
