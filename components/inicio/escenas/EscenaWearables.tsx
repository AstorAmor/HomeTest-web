"use client";

import { Contador, REINICIO_MS, escalon, useFases } from "./animacion";

export interface DatosWearables {
  estado: string;
  anillo_titulo: string;
  lecturas: { valor: number; nota: string; sueno: string; pulso: string; vfc: string }[];
  sueno: string;
  pulso: string;
  vfc: string;
}

// Paso "Conecta": el reloj sincroniza, el anillo de preparación se llena y llegan sueño, pulso y
// variabilidad con su minigráfica. En cada vuelta, una mañana distinta.
const FASES = [700, 1700, 1300, 3600] as const;

const R = 42;
const C = 2 * Math.PI * R;

// Minigráficas de los últimos días (0 abajo, 1 arriba), una por fila
const LINEAS = [
  [0.35, 0.5, 0.42, 0.6, 0.55, 0.72, 0.68],
  [0.7, 0.62, 0.66, 0.5, 0.48, 0.4, 0.36],
  [0.3, 0.42, 0.38, 0.52, 0.6, 0.58, 0.74],
];
const puntos = (ys: number[]) => ys.map((y, i) => `${(i / (ys.length - 1)) * 60},${22 - y * 20}`).join(" ");

export default function EscenaWearables({ datos, activa }: { datos: DatosWearables; activa: boolean }) {
  const { fase, vuelta } = useFases(activa, FASES);
  const lectura = datos.lecturas[vuelta % datos.lecturas.length];
  const filas = [
    { nombre: datos.sueno, valor: lectura.sueno },
    { nombre: datos.pulso, valor: lectura.pulso },
    { nombre: datos.vfc, valor: lectura.vfc },
  ];

  return (
    <div className="vidrio entra w-[70%] p-[1.2em] sm:w-[58%]" data-on={fase >= 1}>
      <span className="inline-flex items-center gap-[0.45em] rounded-full bg-accent/[0.07] px-[0.7em] py-[0.25em] text-[0.72em] font-semibold text-accent">
        <span className="latido h-[0.5em] w-[0.5em] rounded-full bg-[#5f9a7c]" />
        {datos.estado}
      </span>

      <div className="mt-[0.9em] flex items-center gap-[1em]">
        <div className="relative h-[5.6em] w-[5.6em] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(14 42 36 / 0.09)" strokeWidth="7" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="url(#kuova-anillo)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={fase >= 1 ? C * (1 - lectura.valor / 100) : C}
              className="transition-[stroke-dashoffset] duration-[1500ms] ease-out"
              style={fase === 0 ? { transition: `stroke-dashoffset 0s ${REINICIO_MS}ms` } : undefined}
            />
            <defs>
              <linearGradient id="kuova-anillo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6F8C7C" />
                <stop offset="100%" stopColor="#C9A36B" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-[1.9em] leading-none">
            <Contador hasta={lectura.valor} activo={fase >= 1} duracion={1500} />
          </span>
        </div>
        <div>
          <p className="text-[1.05em] font-semibold">{datos.anillo_titulo}</p>
          <p className="entra mt-[0.15em] text-[0.85em] text-text-muted" data-on={fase >= 2}>
            {lectura.nota}
          </p>
        </div>
      </div>

      <ul className="mt-[1em] divide-y divide-accent/10 border-t border-accent/10">
        {filas.map((fila, i) => (
          <li key={fila.nombre} className="entra flex items-center gap-[0.6em] py-[0.5em]" data-on={fase >= 2} style={escalon(fase >= 2, i, 160)}>
            <span className="flex-1 text-[0.82em] text-text-muted">{fila.nombre}</span>
            <span className="text-[0.88em] font-semibold tabular-nums">{fila.valor}</span>
            <svg viewBox="0 0 60 24" className="h-[1.4em] w-[3.4em] shrink-0 overflow-visible">
              <polyline
                points={puntos(LINEAS[i])}
                fill="none"
                stroke="#C9A36B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                className="trazo"
                data-on={fase >= 2}
                style={escalon(fase >= 2, i, 160, 200)}
              />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
}
