"use client";

import datos from "@/content/conocimiento/datos.json";
import ChartFrame, { barPath, C, fmt } from "./core";

// Probabilidad de que una persona sana tenga al menos un resultado fuera de rango: 1 − 0,95^n
export default function OutOfRangeChart() {
  const rows = datos.fuera_de_rango.numero_de_pruebas.map((n) => ({ n, p: (1 - Math.pow(0.95, n)) * 100 }));

  return (
    <ChartFrame
      title="Personas sanas con al menos un resultado fuera de rango, según cuántas pruebas incluye la analítica"
      caption="Cálculo teórico: cada prueba deja fuera, por definición, al 5 % de las personas sanas. Supone pruebas independientes; en la realidad algunas van juntas, así que la cifra real es algo menor, pero la idea se mantiene."
      table={{ head: ["Pruebas", "Al menos una fuera de rango"], rows: rows.map((r) => [r.n, `${fmt(r.p)} %`]) }}
    >
      {(width, tip) => {
        const M = { l: 44, r: 8, t: 22, b: 40 };
        const H = width < 520 ? 240 : 270;
        const iw = width - M.l - M.r;
        const ih = H - M.t - M.b;
        const band = iw / rows.length;
        const bw = Math.min(56, band * 0.56);
        const Y = (v: number) => M.t + ih - (v / 100) * ih;
        return (
          <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block h-auto max-w-full" role="img" aria-label="Gráfica de barras: probabilidad de al menos un resultado fuera de rango según el número de pruebas">
            {[0, 25, 50, 75, 100].map((t) => (
              <g key={t}>
                <line x1={M.l} x2={M.l + iw} y1={Y(t)} y2={Y(t)} stroke={t === 0 ? C.axis : C.grid} />
                <text x={M.l - 8} y={Y(t) + 4} textAnchor="end" fontSize={11} fill={C.muted}>
                  {t} %
                </text>
              </g>
            ))}
            {rows.map((r, i) => {
              const x = M.l + band * i + (band - bw) / 2;
              const y = Y(r.p);
              return (
                <g key={r.n}>
                  <path d={barPath(x, y, bw, M.t + ih - y, "up")} fill={C.s1} />
                  <text x={x + bw / 2} y={y - 7} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={C.text}>
                    {fmt(r.p)} %
                  </text>
                  <text x={x + bw / 2} y={M.t + ih + 17} textAnchor="middle" fontSize={11.5} fill={C.text}>
                    {r.n}
                  </text>
                  <rect
                    x={M.l + band * i}
                    y={M.t}
                    width={band}
                    height={ih}
                    fill="transparent"
                    onPointerMove={(e) =>
                      tip.show(
                        e,
                        <>
                          <b>
                            {r.n} {r.n === 1 ? "prueba" : "pruebas"}
                          </b>
                          <br />
                          {fmt(r.p)} % de las personas sanas tendría al menos un resultado fuera de rango
                        </>
                      )
                    }
                  />
                </g>
              );
            })}
            <text x={M.l + iw / 2} y={H - 4} textAnchor="middle" fontSize={11} fill={C.muted}>
              número de pruebas en la analítica
            </text>
          </svg>
        );
      }}
    </ChartFrame>
  );
}
