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
// variabilidad con su minigráfica. En cada vuelta, una mañana distinta. El anillo es el de la app nueva: fino,
// en jade y con un punto de luz en la punta.
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
      <span className="inline-flex items-center gap-[0.5em] text-[0.68em] font-semibold uppercase tracking-[0.1em] text-text-muted">
        <span className="latido h-[0.5em] w-[0.5em] rounded-full bg-accent" />
        {datos.estado}
      </span>

      <div className="mt-[0.9em] flex items-center gap-[1em]">
        <div className="relative h-[5.6em] w-[5.6em] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(240 239 230 / 0.1)" strokeWidth="3" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="url(#kuova-anillo)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={fase >= 1 ? C * (1 - lectura.valor / 100) : C}
              className="transition-[stroke-dashoffset] duration-[1500ms] ease-out"
              style={fase === 0 ? { transition: `stroke-dashoffset 0s ${REINICIO_MS}ms` } : undefined}
            />
            {/* El punto de luz de la punta gira a la vez que se llena el anillo */}
            <g
              className="transition-transform duration-[1500ms] ease-out"
              style={{ transform: `rotate(${fase >= 1 ? lectura.valor * 3.6 : 0}deg)`, transformOrigin: "50px 50px", ...(fase === 0 ? { transition: `transform 0s ${REINICIO_MS}ms` } : {}) }}
            >
              <circle cx={50 + R} cy="50" r="6.5" fill="#83D6B4" opacity="0.3" />
              <circle cx={50 + R} cy="50" r="2.8" fill="#F7F3E6" />
            </g>
            <defs>
              <linearGradient id="kuova-anillo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2F8F70" />
                <stop offset="100%" stopColor="#83D6B4" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[1.9em] font-light leading-none tabular-nums">
            <Contador hasta={lectura.valor} activo={fase >= 1} duracion={1500} />
          </span>
        </div>
        <div>
          <p className="text-[1.05em] font-medium">{datos.anillo_titulo}</p>
          <p className="entra mt-[0.15em] text-[0.85em] text-text-muted" data-on={fase >= 2}>
            {lectura.nota}
          </p>
        </div>
      </div>

      <ul className="mt-[1em] divide-y divide-text/10 border-t border-text/10">
        {filas.map((fila, i) => (
          <li key={fila.nombre} className="entra flex items-center gap-[0.6em] py-[0.5em]" data-on={fase >= 2} style={escalon(fase >= 2, i, 160)}>
            <span className="flex-1 text-[0.82em] text-text-muted">{fila.nombre}</span>
            <span className="text-[0.88em] font-medium tabular-nums">{fila.valor}</span>
            <svg viewBox="0 0 60 24" className="h-[1.4em] w-[3.4em] shrink-0 overflow-visible">
              <polyline
                points={puntos(LINEAS[i])}
                fill="none"
                stroke="#83D6B4"
                strokeWidth="1.6"
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
