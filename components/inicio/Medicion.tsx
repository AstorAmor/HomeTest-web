"use client";

import { useEffect } from "react";
import { iniciarMedicion, medir, medirSalida } from "@/lib/medicion";

// Medición de la página (lib/medicion.ts): la visita al cargar y, mientras dura, qué secciones se
// ven, qué se pulsa y cuánto tiempo se queda la persona. No pinta nada.

// Secciones de la portada que cuentan como "vista" al aparecer en pantalla
const SECCIONES = [
  "intro",
  "como-funciona",
  "cuentanos",
  "conecta",
  "registra",
  "mide",
  "entiende",
  "actua",
  "repite",
  "edad-kuova",
  "privacidad",
  "preguntas",
  "lista-de-espera",
];

const etiqueta = (el: HTMLElement) =>
  (el.dataset.medir || el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);

export default function Medicion({ lang }: { lang: string }) {
  useEffect(() => {
    iniciarMedicion(lang);

    // Secciones vistas (una vez cada una por visita)
    const vistas = new Set<string>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          const id = (e.target as HTMLElement).id;
          if (e.isIntersecting && !vistas.has(id)) {
            vistas.add(id);
            medir("seccion", id);
            observador.unobserve(e.target);
          }
        }
      },
      // Cuenta cuando entra en la franja central de la pantalla (sirve también para secciones más
      // altas que la pantalla, como "Cómo funciona")
      { rootMargin: "-20% 0px -40% 0px" },
    );
    for (const id of SECCIONES) {
      const el = document.getElementById(id);
      if (el) observador.observe(el);
    }

    // Clics en enlaces y botones: "zona · texto" (p. ej. "preguntas · ¿Qué es Kuova?")
    const alPulsar = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement | null)?.closest<HTMLElement>("a, button");
      if (!el) return;
      const zona = el.closest<HTMLElement>("section[id], li[id]")?.id ?? el.closest("header, footer, nav")?.tagName.toLowerCase() ?? "portada";
      medir("clic", `${zona} · ${etiqueta(el)}`);
    };
    document.addEventListener("click", alPulsar, true);

    // Tiempo con la página a la vista y hasta dónde se ha bajado (en %)
    let segundos = 0;
    let desde = document.visibilityState === "visible" ? performance.now() : 0;
    let scroll = 0;
    const alBajar = () => {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto > 0) scroll = Math.max(scroll, Math.min(100, (window.scrollY / alto) * 100));
    };
    const alOcultar = () => {
      if (desde) segundos += (performance.now() - desde) / 1000;
      desde = 0;
      medirSalida(segundos, scroll);
    };
    const alCambiar = () => {
      if (document.visibilityState === "hidden") alOcultar();
      else desde = performance.now();
    };
    window.addEventListener("scroll", alBajar, { passive: true });
    document.addEventListener("visibilitychange", alCambiar);
    window.addEventListener("pagehide", alOcultar);

    return () => {
      observador.disconnect();
      document.removeEventListener("click", alPulsar, true);
      window.removeEventListener("scroll", alBajar);
      document.removeEventListener("visibilitychange", alCambiar);
      window.removeEventListener("pagehide", alOcultar);
    };
  }, [lang]);

  return null;
}
