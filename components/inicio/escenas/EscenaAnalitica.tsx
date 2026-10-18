"use client";

import { useMemo } from "react";
import { REINICIO_MS, useFases } from "./animacion";

export interface DatosAnalitica {
  titulo: string;
  procesando: string;
  sistemas: string[];
  listo: string;
}

// Paso "Mide": los sistemas del cuerpo se van analizando uno tras otro hasta "Resultados listos".
// Fases: 0 vacía, 1 aparece la tarjeta (empieza el primero), 2…n+1 termina cada sistema,
// n+2 resultados listos, n+3 pausa.
export default function EscenaAnalitica({ datos, activa }: { datos: DatosAnalitica; activa: boolean }) {
  const n = datos.sistemas.length;
  const fases = useMemo(() => [700, ...Array<number>(n).fill(650), 900, 3400], [n]);
  const { fase } = useFases(activa, fases);
  const hechos = Math.max(0, Math.min(n, fase - 1));
  const listo = fase >= n + 2;

  return (
    <div className="vidrio entra w-[66%] p-[1.2em] sm:w-[54%]" data-on={fase >= 1}>
      <div className="flex items-baseline justify-between gap-[0.8em]">
        <p className="font-display text-[1.3em]">{datos.titulo}</p>
        <p className={`text-[0.72em] font-semibold transition-colors duration-500 ${listo ? "text-accent-light" : "text-text-muted"}`}>
          {listo ? datos.listo : datos.procesando}
        </p>
      </div>

      <div className="mt-[0.7em] h-[0.3em] overflow-hidden rounded-full bg-accent/[0.08]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#6F8C7C] to-gold transition-[width] duration-500 ease-out" style={{ width: `${(hechos / n) * 100}%`, transitionDelay: hechos === 0 ? `${REINICIO_MS}ms` : "0ms" }} />
      </div>

      <ul className="mt-[0.8em] space-y-[0.5em]">
        {datos.sistemas.map((sistema, i) => {
          const estado = i < hechos ? "hecho" : fase >= 1 && i === hechos && !listo ? "analizando" : "pendiente";
          return (
            <li key={sistema} className="flex items-center gap-[0.65em]">
              <span className="estado-sistema" data-estado={estado} />
              <span className={`text-[0.9em] transition-colors duration-300 ${estado === "pendiente" ? "text-text-muted/70" : "font-medium text-text"}`}>
                {sistema}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
