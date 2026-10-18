// Genera los fondos de "capas" de la portada (public/images/inicio/capas-*.jpg) con Edge sin ventana.
// Uso, desde la carpeta HomeTest-web:  node scripts/capas/render.mjs
// La forma (5 láminas de curvas suaves, sombra leve, hilo dorado arriba) es la de «Capas, versión
// sobria» de la imagen de marca de Tu edad KUOVA; los parámetros de cada imagen van en TRABAJOS.
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const salida = path.join(aqui, "..", "..", "public", "images", "inicio");
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PUERTO = 9336;

// [archivo, ancho, alto, tema, hacia dónde suben las láminas, semilla, intensidad del hilo dorado]
const TRABAJOS = [
  ["capas-claro", 2400, 900, "light", "centro", 21, 0.55],
  ["capas-claro-movil", 1000, 1300, "light", "radial", 21, 0.55],
  ["capas-verde", 2400, 900, "dark", "derecha", 21, 0.85],
  ["capas-verde-movil", 1000, 1300, "dark", "diagonal", 21, 0.85],
];

const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${process.env.TEMP}/kuova_capas`, "about:blank"]);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let paginas;
for (let i = 0; i < 40 && !paginas?.some((p) => p.type === "page"); i++) {
  try {
    paginas = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json();
  } catch {}
  await espera(250);
}
const ws = new WebSocket(paginas.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const pendientes = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendientes.has(m.id)) {
    pendientes.get(m.id)(m.result ?? m.error);
    pendientes.delete(m.id);
  }
};
const enviar = (method, params = {}) =>
  new Promise((r) => {
    const id = ++n;
    pendientes.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });

await enviar("Page.navigate", { url: pathToFileURL(path.join(aqui, "capas.html")).href });
await espera(1500);
for (const [nombre, w, h, tema, dir, semilla, oro] of TRABAJOS) {
  const r = await enviar("Runtime.evaluate", { expression: `pintar(${w}, ${h}, '${tema}', '${dir}', ${semilla}, ${oro})`, returnByValue: true });
  writeFileSync(path.join(salida, `${nombre}.jpg`), Buffer.from(r.result.value.split(",")[1], "base64"));
  console.log("ok", nombre);
}
ws.close();
edge.kill();
process.exit(0);
