"use client";

import { useState } from "react";
import datos from "@/content/conocimiento/datos.json";
import ChartFrame, { C, fmt } from "./core";

// Cuánto del cambio final se ve con el paso de las semanas: 1 − 2^(−t / vida media)
export default function KineticsChart() {
  const { semanas, marcadores } = datos.tiempos;
  const colors = [C.s1, C.s2];
  const series = marcadores.map((m, i) => {
    const half = m.vida_media_dias / 7;
    return { ...m, color: colors[i], half, t90: half * Math.log2(10) };
  });
  const pct = (half: number, t: number) => 100 * (1 - Math.pow(2, -t / half));
  const [hover, setHover] = useState<number | null>(null);

  return (
    <ChartFrame
      title="Qué parte del cambio final se ve, semana a semana, tras un cambio sostenido"
      legend={series.map((s) => ({ label: s.nombre, color: s.color, kind: "line" as const }))}
      caption="Curvas ilustrativas a partir de las vidas medias publicadas (vitamina D, unos 15 días; HbA1c, unos 35 días). Las líneas verticales marcan cuándo se alcanza el 90 % del efecto: el momento sensato para volver a medir."
      table={{
        head: ["Semana", ...series.map((s) => s.nombre)],
        rows: [2, 4, 6, 8, 12, 16, 20, 24]
          .filter((t) => t <= semanas)
          .map((t) => [t, ...series.map((s) => `${fmt(pct(s.half, t))} %`)]),
      }}
    >
      {(width, tip) => {
        const narrow = width < 520;
        const M = { l: 44, r: narrow ? 12 : 92, t: 12, b: 40 };
        const H = narrow ? 250 : 290;
        const iw = width - M.l - M.r;
        const ih = H - M.t - M.b;
        const X = (t: number) => M.l + (t / semanas) * iw;
        const Y = (v: number) => M.t + ih - (v / 100) * ih;
        const line = (half: number) =>
          Array.from({ length: 97 }, (_, i) => {
            const t = (i / 96) * semanas;
            return `${i ? "L" : "M"}${X(t).toFixed(1)},${Y(pct(half, t)).toFixed(1)}`;
          }).join("");
        // Etiquetas al final de cada línea, separadas para que no se pisen
        const ends = series.map((s) => ({ s, y: Y(pct(s.half, semanas)) })).sort((a, b) => a.y - b.y);
        ends.forEach((e, i) => {
          if (i > 0 && e.y - ends[i - 1].y < 16) e.y = ends[i - 1].y + 16;
        });
        return (
          <svg
            width={width}
            height={H}
            viewBox={`0 0 ${width} ${H}`}
            className="block h-auto max-w-full"
            role="img"
            aria-label="Gráfica de líneas: porcentaje del cambio final según las semanas para vitamina D y HbA1c"
            onPointerMove={(e) => {
              const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
              const t = Math.round((((e.clientX - r.left - M.l) / iw) * semanas) * 2) / 2;
              if (t < 0 || t > semanas) return;
              setHover(t);
              tip.show(
                e,
                <>
                  <b>Semana {fmt(t, t % 1 ? 1 : 0)}</b>
                  {series.map((s) => (
                    <span key={s.nombre} className="mt-0.5 flex justify-between gap-4">
                      <span>{s.nombre}</span>
                      <span className="tabular-nums">{fmt(pct(s.half, t))} %</span>
                    </span>
                  ))}
                </>
              );
            }}
            onPointerLeave={() => setHover(null)}
          >
            {[0, 25, 50, 75, 100].map((t) => (
              <g key={t}>
                <line x1={M.l} x2={M.l + iw} y1={Y(t)} y2={Y(t)} stroke={t === 0 ? C.axis : C.grid} />
                <text x={M.l - 8} y={Y(t) + 4} textAnchor="end" fontSize={11} fill={C.muted}>
                  {t} %
                </text>
              </g>
            ))}
            <line x1={M.l} x2={M.l + iw} y1={Y(90)} y2={Y(90)} stroke={C.bandEdge} strokeDasharray="4 4" />
            <text x={M.l - 8} y={Y(90) + 4} textAnchor="end" fontSize={11} fontWeight={600} fill={C.text}>
              90 %
            </text>
            {[0, 4, 8, 12, 16, 20, 24].filter((t) => t <= semanas).map((t) => (
              <text key={t} x={X(t)} y={M.t + ih + 17} textAnchor="middle" fontSize={11} fill={C.muted}>
                {t}
              </text>
            ))}
            <text x={M.l + iw / 2} y={H - 4} textAnchor="middle" fontSize={11} fill={C.muted}>
              semanas desde el cambio
            </text>
            {series.map((s) => (
              <g key={s.nombre}>
                <line x1={X(s.t90)} x2={X(s.t90)} y1={Y(90)} y2={M.t + ih} stroke={s.color} strokeDasharray="2 3" />
                <path d={line(s.half)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
                <circle cx={X(s.t90)} cy={Y(90)} r={4.5} fill={s.color} stroke={C.surface} strokeWidth={2} />
                <text x={X(s.t90) + 5} y={M.t + ih - 6} fontSize={11} fontWeight={600} fill={C.text}>
                  {fmt(s.t90)} sem
                </text>
              </g>
            ))}
            {!narrow &&
              ends.map(({ s, y }) => (
                <text key={s.nombre} x={M.l + iw + 8} y={y + 4} fontSize={12} fill={C.text}>
                  {s.nombre.replace(/,.*$/, "")}
                </text>
              ))}
            {hover !== null && (
              <g pointerEvents="none">
                <line x1={X(hover)} x2={X(hover)} y1={M.t} y2={M.t + ih} stroke={C.muted} strokeWidth={1} />
                {series.map((s) => (
                  <circle key={s.nombre} cx={X(hover)} cy={Y(pct(s.half, hover))} r={4.5} fill={s.color} stroke={C.surface} strokeWidth={2} />
                ))}
              </g>
            )}
            <rect x={M.l} y={M.t} width={iw} height={ih} fill="transparent" />
          </svg>
        );
      }}
    </ChartFrame>
  );
}
