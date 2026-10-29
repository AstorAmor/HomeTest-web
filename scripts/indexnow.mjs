// IndexNow: avisa a Bing (y, por el mismo protocolo, a Yandex, Seznam y Naver) de las direcciones de
// kuovahealth.com que han cambiado, para que las vuelvan a leer pronto. Google no lo usa.
//
// Lo lanza solo la GitHub Action .github/workflows/indexnow.yml después de cada publicación en
// producción: compara el commit publicado con el de la publicación anterior y avisa solo de las
// páginas cuyo contenido cambió (nunca de todas). También se puede usar a mano:
//   node scripts/indexnow.mjs --desde <commit> --hasta <commit>   (lo que cambió entre dos commits)
//   node scripts/indexnow.mjs https://kuovahealth.com/ferritina …  (direcciones sueltas)
// Añade --prueba para ver qué enviaría sin enviarlo.
//
// La clave es pública por diseño: Bing comprueba que somos los dueños leyendo
// https://kuovahealth.com/<CLAVE>.txt (el archivo está en public/).

import { execFileSync } from "node:child_process";

const HOST = "kuovahealth.com";
const SITE = `https://${HOST}`;
const CLAVE = "3acc59c3b293bdc333e934e1b4d2a38a";

// Qué páginas cambian cuando cambia un archivo de contenido. Los cambios de código no cuentan.
function direccionesDe(archivo) {
  let m;
  if ((m = archivo.match(/^content\/guias\/([\w-]+)\.md$/))) return [`/${m[1]}`, "/aprende"];
  if ((m = archivo.match(/^content\/(biomarcadores|comparativas|conocimiento)\/([\w-]+)\.md$/))) return [`/${m[1]}/${m[2]}`, `/${m[1]}`, "/aprende"];
  // Datos de los gráficos de un número de Kuova Letter (scripts/importar-numero.mjs)
  if ((m = archivo.match(/^content\/conocimiento\/kuova-letter\/([\w-]+)\.json$/))) return [`/conocimiento/${m[1]}`];
  if (archivo === "content/aprende.json") return ["/aprende"];
  if (archivo === "content/inicio.json" || /^public\/(images|videos)\/inicio\//.test(archivo)) return ["/"];
  if (archivo === "content/en/inicio.json") return ["/en"];
  if (archivo === "content/legal.ts") return ["/privacy", "/en/privacy", "/terms", "/en/terms"];
  if (archivo === "content/newsletter.json") return ["/newsletter"];
  return [];
}

function cambiadas(desde, hasta) {
  // Solo archivos añadidos o modificados (los borrados no tienen página que leer)
  const salida = execFileSync("git", ["diff", "--name-only", "--diff-filter=AMR", desde, hasta], { encoding: "utf8" });
  return salida.split("\n").filter(Boolean).flatMap(direccionesDe);
}

// Las direcciones que existen hoy en la web (sin borradores ni páginas ocultas)
async function delSitemap() {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}

async function main() {
  const args = process.argv.slice(2);
  const prueba = args.includes("--prueba");
  const valor = (nombre) => args[args.indexOf(nombre) + 1];
  const rutas = args.includes("--desde")
    ? cambiadas(valor("--desde"), args.includes("--hasta") ? valor("--hasta") : "HEAD")
    : args.filter((a) => a.startsWith("http"));

  const enLaWeb = await delSitemap();
  const urlList = [...new Set(rutas.map((r) => (r.startsWith("http") ? r : `${SITE}${r}`)))].filter((u) => enLaWeb.has(u));
  if (!urlList.length) return console.log("IndexNow: no ha cambiado ninguna página publicada; no se avisa a nadie.");
  console.log(`IndexNow: ${urlList.length} direcciones`, ...urlList.map((u) => `\n${u}`));
  if (prueba) return;

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: CLAVE, keyLocation: `${SITE}/${CLAVE}.txt`, urlList }),
  });
  // 200 = recibido; 202 = recibido, la clave se está comprobando. Lo demás es un error.
  console.log(`IndexNow respondió ${res.status} ${res.statusText}`);
  if (res.status !== 200 && res.status !== 202) {
    console.error(await res.text());
    process.exitCode = 1;
  }
}

await main();
