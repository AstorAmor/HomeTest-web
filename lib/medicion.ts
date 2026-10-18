"use client";

import { clasificar, hostDe, type Atribucion } from "./canales";

// Medición en el navegador, sin cookies: al cargar la página se calcula de dónde llega la visita
// (lib/canales.ts) y se manda a /api/medir con un identificador de esta página cargada, que vive
// solo en memoria. Los eventos (secciones vistas, clics, apuntarse, tiempo) llevan ese mismo
// identificador. Solo se mide en kuovahealth.com.
//
// Para que tus propias visitas no cuenten, abre una vez kuovahealth.com/?no-contar=1 en cada
// navegador que uses (se recuerda en ese navegador); ?no-contar=0 lo deshace.

const PRUEBA_LOCAL = "prueba-local";

let estado: { id: string; atribucion: Atribucion; activo: boolean; listo: Promise<unknown> } | null = null;

function nuevoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function activo(params: URLSearchParams): boolean {
  try {
    if (params.get("no-contar") === "1") localStorage.setItem("kuova-no-contar", "1");
    if (params.get("no-contar") === "0") localStorage.removeItem("kuova-no-contar");
    if (localStorage.getItem("kuova-no-contar")) return false;
  } catch {}
  const host = location.hostname;
  // En el servidor local solo con ?medir (para probar); esas visitas llevan la fuente "prueba-local"
  return host === "kuovahealth.com" || host === "www.kuovahealth.com" || (host === "localhost" && params.has("medir"));
}

function enviar(cuerpo: Record<string, unknown>, alSalir = false) {
  const datos = JSON.stringify(cuerpo);
  if (alSalir && navigator.sendBeacon) {
    navigator.sendBeacon("/api/medir", datos);
    return Promise.resolve();
  }
  return fetch("/api/medir", { method: "POST", body: datos, keepalive: true }).catch(() => {});
}

// Se llama una vez por página cargada (components/inicio/Medicion.tsx)
export function iniciarMedicion(idioma: string) {
  if (estado || typeof window === "undefined") return;
  // El panel y el editor de textos no cuentan como visitas
  if (/\/(panel|editar)(\/|$)/.test(location.pathname)) return;
  const params = new URLSearchParams(location.search);
  const atribucion = clasificar(params, hostDe(document.referrer, location.hostname));
  if (location.hostname === "localhost") atribucion.fuente = PRUEBA_LOCAL;
  const id = nuevoId();
  const on = activo(params);
  const listo = on
    ? enviar({ t: "v", id, ruta: location.pathname, idioma, ancho: window.innerWidth, a: atribucion })
    : Promise.resolve();
  estado = { id, atribucion, activo: on, listo };
}

// Algo que pasa en esta visita (espera a que la visita esté guardada)
export function medir(tipo: string, detalle?: string, valor?: number) {
  if (!estado?.activo) return;
  const { id } = estado;
  void estado.listo.then(() => enviar({ t: "e", id, tipo, detalle, valor }));
}

// Al salir de la página (o al pasar a otra pestaña por última vez): tiempo y hasta dónde bajó
export function medirSalida(segundos: number, scroll: number) {
  if (!estado?.activo) return;
  enviar({ t: "e", id: estado.id, tipo: "salida", detalle: `scroll ${Math.round(scroll)}%`, valor: Math.round(segundos) }, true);
}

// Lo que acompaña a un alta en la lista de espera
export function datosDeLlegada() {
  return { a: estado?.atribucion ?? null, ruta: typeof location !== "undefined" ? location.pathname : "/" };
}
