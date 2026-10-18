"use client";

import { useMemo } from "react";
import { useFases } from "./animacion";

export interface DatosPlan {
  titulo: string;
  subtitulo: string;
  acciones: string[];
  proyeccion: string;
}

// Paso "Actúa": las acciones del plan se van marcando y al final se dibuja la proyección del
// marcador, que entra en la banda óptima.
export default function EscenaPlan({ datos, activa }: { datos: DatosPlan; activa: boolean }) {
  const n = datos.acciones.length;
  const fases = useMemo(() => [700, 800, ...Array<number>(n).fill(650), 1700, 3400], [n]);
  const { fase } = useFases(activa, fases);
  const marcadas = Math.max(0, Math.min(n, fase - 1));
  const proyeccion = fase >= n + 2;

  return (
    <div className="vidrio entra w-[68%] p-[1.2em] sm:w-[56%]" data-on={fase >= 1}>
      <div className="flex items-baseline justify-between gap-[0.8em]">
        <p className="font-display text-[1.3em]">{datos.titulo}</p>
        <p className="text-[0.72em] font-semibold text-text-muted">{datos.subtitulo}</p>
      </div>

      <ul className="mt-[0.8em] space-y-[0.55em]">
        {datos.acciones.map((accion, i) => (
          <li key={accion} className="flex items-center gap-[0.65em]">
            <span className="check" data-on={i < marcadas} />
            <span className={`text-[0.88em] transition-colors duration-300 ${i < marcadas ? "font-medium text-text" : "text-text-muted"}`}>{accion}</span>
          </li>
        ))}
      </ul>

      <div className="mt-[0.9em] border-t border-accent/10 pt-[0.7em]">
        <p className="etiqueta-escena">{datos.proyeccion}</p>
        <svg viewBox="0 0 200 56" className="mt-[0.4em] h-auto w-full overflow-visible" aria-hidden>
          <rect x="0" y="6" width="200" height="18" rx="4" fill="#6F8C7C" opacity="0.16" />
          <path d="M4 48 C 30 46, 46 42, 70 38" fill="none" stroke="#0E2A24" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="70" cy="38" r="3.5" fill="#0E2A24" />
          {/* La proyección (discontinua) se descubre de izquierda a derecha con una máscara */}
          <mask id="kuova-proyeccion" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="56">
            <path d="M70 38 C 100 32, 130 22, 196 14" fill="none" stroke="white" strokeWidth="8" pathLength={1} className="trazo trazo-lento" data-on={proyeccion} />
          </mask>
          <path
            d="M70 38 C 100 32, 130 22, 196 14"
            fill="none"
            stroke="#C9A36B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="5 5"
            mask="url(#kuova-proyeccion)"
          />
          <circle cx="196" cy="14" r="4" fill="#C9A36B" className="transition-opacity duration-500" style={{ opacity: proyeccion ? 1 : 0, transitionDelay: proyeccion ? "1200ms" : "0ms" }} />
        </svg>
      </div>
    </div>
  );
}
