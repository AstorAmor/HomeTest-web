"use client";

import { RefObject, useEffect, useState } from "react";

// Piezas comunes de las escenas animadas de la portada (components/inicio/Escenario.tsx).

// true mientras el elemento está a la vista (se vuelve a poner en false al salir), para que las
// escenas y los vídeos solo se muevan cuando alguien los está mirando.
export function useEnPantalla(ref: RefObject<HTMLElement>, umbral = 0.35) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: umbral });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, umbral]);
  return visible;
}

export function useMenosMovimiento() {
  const [menos, setMenos] = useState(false);
  useEffect(() => {
    setMenos(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return menos;
}

// Una escena es una secuencia de fases (0 = vacía, luego 1, 2…) con la duración de cada una en ms.
// Se repite en bucle mientras está a la vista y se queda quieta fuera de ella. `vuelta` cuenta las
// repeticiones (para cambiar los datos en cada pasada). Con "reducir movimiento" se ve la escena
// completa (última fase), sin animar.
export function useFases(activa: boolean, duraciones: readonly number[]) {
  const ultima = duraciones.length - 1;
  const menos = useMenosMovimiento();
  const [estado, setEstado] = useState({ fase: 0, vuelta: 0 });

  useEffect(() => {
    if (!activa || menos) return;
    const t = setTimeout(
      () => setEstado((e) => (e.fase >= ultima ? { fase: 0, vuelta: e.vuelta + 1 } : { fase: e.fase + 1, vuelta: e.vuelta })),
      duraciones[estado.fase],
    );
    return () => clearTimeout(t);
  }, [activa, menos, estado, ultima, duraciones]);

  return menos ? { fase: ultima, vuelta: 0 } : estado;
}

const suave = (t: number) => 1 - Math.pow(1 - t, 3);

// Lo que tarda una escena en desvanecerse al volver a empezar (.entra en globals.css): los datos
// se reinician pasado este tiempo, ya sin verse.
export const REINICIO_MS = 650;

// Número que sube de `desde` a `hasta` cuando `activo` pasa a true. Al apagarse vuelve a `desde`
// cuando la tarjeta ya se ha desvanecido (REINICIO_MS), para que no se vea bajar. Con `idioma`, los
// decimales llevan la coma o el punto que toque ("34,2" en español).
export function Contador({
  hasta,
  desde = 0,
  activo,
  duracion = 1400,
  decimales = 0,
  idioma,
}: {
  hasta: number;
  desde?: number;
  activo: boolean;
  duracion?: number;
  decimales?: number;
  idioma?: string;
}) {
  const menos = useMenosMovimiento();
  const [n, setN] = useState(desde);

  useEffect(() => {
    if (!activo) {
      const t = setTimeout(() => setN(desde), REINICIO_MS);
      return () => clearTimeout(t);
    }
    if (menos) {
      setN(hasta);
      return;
    }
    let frame = 0;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const p = Math.min(1, (ahora - inicio) / duracion);
      setN(desde + (hasta - desde) * suave(p));
      if (p < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [activo, desde, hasta, duracion, menos]);

  return <>{idioma ? n.toLocaleString(idioma, { minimumFractionDigits: decimales, maximumFractionDigits: decimales }) : n.toFixed(decimales)}</>;
}

// Retraso escalonado para los elementos de una lista (solo al aparecer; al irse, todos a la vez).
export const escalon = (on: boolean, i: number, paso = 110, base = 0) =>
  on ? { transitionDelay: `${base + i * paso}ms` } : undefined;

// Colocación de la tarjeta de cristal dentro de la imagen (pantallas anchas), para no tapar caras
// ni objetos. En el móvil va siempre centrada, debajo de la foto.
export const LADO: Record<string, string> = {
  izquierda: "sm:justify-start",
  derecha: "sm:justify-end",
  centro: "sm:justify-center",
};
