"use client";

import { Contador, REINICIO_MS, useFases } from "./animacion";

export interface DatosTendencia {
  ejemplo: string;
  marcador: string;
  valores: number[];
  unidad: string;
  rango: string;
  hitos: string[];
}

// Paso "Repite": el marcador se dibuja analítica a analítica hasta entrar en la banda óptima,
// mientras la regla de abajo avanza de un análisis al siguiente. Pensada para tres análisis.
const FASES = [700, 1900, 1900, 1900, 3600] as const;

const W = 300;
const H = 120;
const MAX = 80;
const BANDA: [number, number] = [40, 80];
const XS = [30, 150, 270];
const y = (v: number) => H - 10 - (v / MAX) * (H - 20);

// Regla: una marca cada 0,6em; las de los análisis, cada 12 marcas
const MARCAS = 43;
const HITO = (i: number) => 9 + i * 12;

export default function EscenaTendencia({ datos, activa }: { datos: DatosTendencia; activa: boolean }) {
  const { fase } = useFases(activa, FASES);
  const k = Math.max(0, Math.min(datos.valores.length - 1, fase - 1));
  const ys = datos.valores.map(y);
  const tramos = XS.slice(1).map((x, i) => {
    const x0 = XS[i];
    const mid = (x - x0) / 2;
    return `M${x0} ${ys[i]} C ${x0 + mid} ${ys[i]}, ${x - mid} ${ys[i + 1]}, ${x} ${ys[i + 1]}`;
  });

  return (
    <div className="vidrio entra w-[84%] p-[1.2em] sm:w-[60%]" data-on={fase >= 1}>
      <div className="flex items-start justify-between gap-[0.8em]">
        <div>
          <p className="font-display text-[1.3em]">{datos.marcador}</p>
          <span className="mt-[0.3em] inline-block rounded-full bg-accent/[0.07] px-[0.65em] py-[0.2em] text-[0.66em] font-semibold uppercase tracking-[0.1em] text-text-muted">
            {datos.ejemplo}
          </span>
        </div>
        <p className="font-display text-[2.1em] leading-none tabular-nums">
          <Contador key={k} desde={k > 0 ? datos.valores[k - 1] : 0} hasta={datos.valores[k]} activo={fase >= 1} duracion={1500} />
          <span className="ml-[0.3em] font-sans text-[0.4em] font-medium text-text-muted">{datos.unidad}</span>
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-[0.6em] h-auto w-full overflow-visible" aria-hidden>
        <rect x="0" y={y(BANDA[1])} width={W} height={y(BANDA[0]) - y(BANDA[1])} rx="6" fill="#6F8C7C" opacity="0.16" />
        <text x={W - 6} y={y(BANDA[1]) + 13} textAnchor="end" fontSize="9" fill="#4d6a5b" fontWeight="600">
          {datos.rango}
        </text>
        {tramos.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#0E2A24"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={1}
            className="trazo trazo-lento"
            data-on={fase >= i + 2}
          />
        ))}
        {XS.map((x, i) => {
          const on = fase >= i + 1;
          return (
            <g key={x} className="transition-opacity duration-500" style={{ opacity: on ? 1 : 0, transitionDelay: on && i > 0 ? "1300ms" : "0ms" }}>
              {i === k && fase >= 1 && <circle cx={x} cy={ys[i]} r="5" fill="#C9A36B" className="pulso-punto" />}
              <circle cx={x} cy={ys[i]} r="5" fill={i === datos.valores.length - 1 ? "#C9A36B" : "#0E2A24"} stroke="white" strokeWidth="2" />
            </g>
          );
        })}
      </svg>

      <div className="relative mt-[0.6em] h-[2.6em] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
        <div
          className="regla absolute bottom-[1.2em] flex items-end"
          style={{ left: `calc(50% - ${HITO(k) * 0.6}em)`, transitionDelay: fase === 0 ? `${REINICIO_MS}ms` : "0ms", transitionDuration: fase === 0 ? "0s" : undefined }}
        >
          {Array.from({ length: MARCAS }, (_, i) => {
            const hito = (i - 9) % 12 === 0 && i >= 9;
            return <span key={i} className={`w-[0.6em] shrink-0 border-l ${hito ? "h-[1.1em] border-accent/50" : "h-[0.55em] border-accent/20"}`} />;
          })}
        </div>
        <span className="absolute bottom-[1.2em] left-1/2 h-[1.3em] -translate-x-1/2 border-l-2 border-gold" />
        <span key={k} className="aparece absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.7em] font-semibold text-accent">
          {datos.hitos[k]}
        </span>
      </div>
    </div>
  );
}
