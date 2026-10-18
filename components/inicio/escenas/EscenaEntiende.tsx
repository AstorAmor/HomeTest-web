"use client";

import { Contador, useFases } from "./animacion";

export interface DatosEntiende {
  ejemplo: string;
  marcador: string;
  valor: number;
  unidad: string;
  zonas: string[];
  estado: string;
  relacion_titulo: string;
  relaciones: { texto: string; fuente: string }[];
}

// Paso "Entiende": llega un resultado, se coloca en su rango y se cruza con lo que dicen el
// registro diario y el reloj.
const FASES = [700, 900, 1500, 900, 900, 900, 3400] as const;

// Ancho de cada zona del rango (bajo, óptimo, alto) y dónde cae el valor del ejemplo
const ZONAS = [30, 45, 25];
const POSICION = 0.2;

export default function EscenaEntiende({ datos, activa }: { datos: DatosEntiende; activa: boolean }) {
  const { fase } = useFases(activa, FASES);

  return (
    <div className="flex w-[74%] flex-col gap-[0.7em] sm:w-[62%]">
      <div className="vidrio entra p-[1.2em]" data-on={fase >= 1}>
        <div className="flex items-center justify-between">
          <p className="font-display text-[1.3em]">{datos.marcador}</p>
          <span className="rounded-full bg-accent/[0.07] px-[0.65em] py-[0.2em] text-[0.68em] font-semibold uppercase tracking-[0.1em] text-text-muted">
            {datos.ejemplo}
          </span>
        </div>
        <p className="mt-[0.2em] font-display text-[2.3em] leading-none tabular-nums">
          <Contador hasta={datos.valor} activo={fase >= 2} duracion={1300} />
          <span className="ml-[0.3em] font-sans text-[0.38em] font-medium text-text-muted">{datos.unidad}</span>
        </p>

        <div className="relative mt-[1em]">
          <div className="flex h-[0.45em] gap-[0.2em] overflow-hidden rounded-full">
            {ZONAS.map((ancho, i) => (
              <span key={i} className={i === 1 ? "bg-[#6F8C7C]/60" : "bg-gold/35"} style={{ width: `${ancho}%` }} />
            ))}
          </div>
          <span
            className="absolute top-1/2 h-[1.05em] w-[1.05em] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.2em] border-white bg-accent shadow transition-[left,opacity] duration-[1300ms] ease-out"
            style={{ left: `${(fase >= 2 ? POSICION : 0) * 100}%`, opacity: fase >= 2 ? 1 : 0 }}
          />
          <div className="mt-[0.45em] flex text-[0.68em] text-text-muted">
            {datos.zonas.map((zona, i) => (
              <span key={zona} style={{ width: `${ZONAS[i]}%` }} className={i === 1 ? "text-center" : i === 2 ? "text-right" : ""}>
                {zona}
              </span>
            ))}
          </div>
        </div>

        <p className="entra mt-[0.7em] text-[0.85em] font-semibold text-accent-light" data-on={fase >= 3}>
          {datos.estado}
        </p>
      </div>

      <div className="vidrio entra ml-[12%] p-[1em]" data-on={fase >= 4}>
        <p className="etiqueta-escena">{datos.relacion_titulo}</p>
        <ul className="mt-[0.5em] space-y-[0.45em]">
          {datos.relaciones.map((relacion, i) => (
            <li key={relacion.texto} className="entra flex items-center justify-between gap-[0.6em]" data-on={fase >= 4 + i}>
              <span className="text-[0.88em] font-medium">{relacion.texto}</span>
              <span className="shrink-0 rounded-full bg-gold/20 px-[0.6em] py-[0.15em] text-[0.68em] font-semibold text-accent-light">
                {relacion.fuente}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
