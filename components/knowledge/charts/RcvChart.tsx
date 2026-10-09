"use client";

import datos from "@/content/conocimiento/datos.json";
import ChartFrame, { barPath, C, fmt } from "./core";

// Valor de referencia del cambio (VRC) de cada marcador: 1,96 × √2 × √(CVi² + CVa²)
export const rcv = (cvi: number, cva: number) => 1.96 * Math.SQRT2 * Math.sqrt(cvi * cvi + cva * cva);

export default function RcvChart() {
  const rows = datos.vrc.marcadores.map((m) => ({ ...m, v: rcv(m.cvi, m.cva) })).sort((a, b) => a.v - b.v);
  const max = Math.ceil(Math.max(...rows.map((r) => r.v)) / 25) * 25;

  return (
    <ChartFrame
      title="Cambio mínimo entre dos analíticas para que no sea ruido (VRC, ±%)"
      caption="Variación biológica de las bases Ricos/Westgard y EFLM. La imprecisión del laboratorio (CVa) es la de un laboratorio típico, supuesta; con la del laboratorio concreto las cifras cambian algo. Pasa el ratón o el dedo por una barra para ver el cálculo."
      table={{
        head: ["Marcador", "CVi", "CVa (supuesto)", "VRC"],
        rows: rows.map((r) => [r.nombre, `${fmt(r.cvi, 1)} %`, `${fmt(r.cva, 1)} %`, `±${fmt(r.v)} %`]),
      }}
    >
      {(width, tip) => {
        const narrow = width < 520;
        const M = { l: narrow ? 122 : 158, r: 12, t: 4, b: 26 };
        const row = 28;
        const H = M.t + rows.length * row + M.b;
        const iw = width - M.l - M.r;
        const X = (v: number) => M.l + (v / max) * iw;
        const ticks = Array.from({ length: max / 25 + 1 }, (_, i) => i * 25);
        return (
          <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block h-auto max-w-full" role="img" aria-label="Gráfica de barras: valor de referencia del cambio de cada marcador">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={X(t)} x2={X(t)} y1={M.t} y2={M.t + rows.length * row} stroke={t === 0 ? C.axis : C.grid} />
                <text x={X(t)} y={H - 8} textAnchor={t === 0 ? "start" : t === max ? "end" : "middle"} fontSize={11} fill={C.muted}>
                  {t} %
                </text>
              </g>
            ))}
            {rows.map((r, i) => {
              const y = M.t + i * row;
              const end = X(r.v);
              const inside = end > M.l + iw - 48;
              return (
                <g key={r.nombre}>
                  <text x={M.l - 10} y={y + row / 2 + 4} textAnchor="end" fontSize={narrow ? 11 : 12} fill={C.text}>
                    {r.nombre}
                  </text>
                  <path d={barPath(M.l, y + 7, end - M.l, row - 14, "right")} fill={C.s1} />
                  <text
                    x={inside ? end - 6 : end + 6}
                    y={y + row / 2 + 4}
                    textAnchor={inside ? "end" : "start"}
                    fontSize={11.5}
                    fontWeight={600}
                    fill={inside ? C.surface : C.text}
                  >
                    ±{fmt(r.v)} %
                  </text>
                  <rect
                    x={0}
                    y={y}
                    width={width}
                    height={row}
                    fill="transparent"
                    onPointerMove={(e) =>
                      tip.show(
                        e,
                        <>
                          <b>{r.nombre}</b>
                          <br />
                          Tu cuerpo varía un {fmt(r.cvi, 1)} % y el laboratorio un {fmt(r.cva, 1)} %: entre dos resultados,
                          un cambio menor de ±{fmt(r.v)} % puede ser solo ruido.
                        </>
                      )
                    }
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </ChartFrame>
  );
}
