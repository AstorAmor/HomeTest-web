"use client";

import datos from "@/content/conocimiento/datos.json";
import ChartFrame, { C, fmt } from "./core";

// Rango de la población frente al rango propio de dos personas (datos ilustrativos).
export default function IndividualityChart() {
  const d = datos.individualidad;
  const colors = [C.s1, C.s2];
  const people = d.personas.map((p, i) => {
    const half = (1.96 * d.variacion_pct * p.centro) / 100;
    return { ...p, color: colors[i], lo: p.centro - half, hi: p.centro + half };
  });
  const lastMonth = Math.max(...d.meses, ...people.map((p) => ("nuevo" in p && p.nuevo ? p.nuevo.mes : 0)));
  const [popLo, popHi] = d.rango_poblacion;
  const yMin = 0.5;
  const yMax = 1.5;

  return (
    <ChartFrame
      title={`${d.marcador} de dos personas sanas, medida cada 3 meses (${d.unidad})`}
      legend={[
        ...people.map((p) => ({ label: p.nombre, color: p.color })),
        { label: "Rango de referencia de la población", color: C.band, kind: "band" as const },
      ]}
      caption="Datos ilustrativos. Cada franja de color es el rango propio de esa persona: su valor habitual más o menos lo que varía por sí sola y por el laboratorio. El último resultado de la persona A está dentro del rango de la población, pero muy fuera del suyo."
      table={{
        head: ["Mes", ...people.map((p) => p.nombre)],
        rows: [
          ...d.meses.map((m, i) => [m, ...people.map((p) => fmt(p.valores[i], 2))]),
          ...people.flatMap((p) =>
            "nuevo" in p && p.nuevo
              ? [[p.nuevo.mes, ...people.map((q) => (q === p ? `${fmt(p.nuevo!.valor, 2)} (nuevo)` : "—"))]]
              : []
          ),
        ],
      }}
    >
      {(width, tip) => {
        const narrow = width < 520;
        const M = { l: 44, r: narrow ? 12 : 86, t: 14, b: 34 };
        const H = narrow ? 270 : 310;
        const iw = width - M.l - M.r;
        const ih = H - M.t - M.b;
        const X = (m: number) => M.l + ((m + 1) / (lastMonth + 2)) * iw;
        const Y = (v: number) => M.t + ih - ((v - yMin) / (yMax - yMin)) * ih;
        const ticks = [0.6, 0.8, 1.0, 1.2, 1.4];
        return (
          <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block h-auto max-w-full" role="img" aria-label={`Gráfica: ${d.marcador}, rango de la población frente al rango propio de dos personas`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={M.l} x2={M.l + iw} y1={Y(t)} y2={Y(t)} stroke={C.grid} />
                <text x={M.l - 8} y={Y(t) + 4} textAnchor="end" fontSize={11} fill={C.muted}>
                  {fmt(t, 1)}
                </text>
              </g>
            ))}
            {/* Rango de la población */}
            <rect x={M.l} y={Y(popHi)} width={iw} height={Y(popLo) - Y(popHi)} fill={C.band} />
            {[popLo, popHi].map((v) => (
              <line key={v} x1={M.l} x2={M.l + iw} y1={Y(v)} y2={Y(v)} stroke={C.bandEdge} strokeDasharray="4 4" />
            ))}
            {/* Rangos propios */}
            {people.map((p) => (
              <g key={p.nombre}>
                <rect x={M.l} y={Y(p.hi)} width={iw} height={Y(p.lo) - Y(p.hi)} fill={p.color} opacity={0.12} />
                {!narrow && (
                  <text x={M.l + iw + 8} y={Y(p.centro) + 4} fontSize={12} fill={C.text}>
                    {p.nombre}
                  </text>
                )}
              </g>
            ))}
            {/* Eje X */}
            <line x1={M.l} x2={M.l + iw} y1={M.t + ih} y2={M.t + ih} stroke={C.axis} />
            {[0, 6, 12, 18, 24].filter((m) => m <= lastMonth).map((m) => (
              <text key={m} x={X(m)} y={M.t + ih + 18} textAnchor="middle" fontSize={11} fill={C.muted}>
                {m === 0 ? "mes 0" : m}
              </text>
            ))}
            {/* Medidas */}
            {people.map((p) =>
              d.meses.map((m, i) => (
                <g key={`${p.nombre}-${m}`}>
                  <circle cx={X(m)} cy={Y(p.valores[i])} r={5} fill={p.color} stroke={C.surface} strokeWidth={2} />
                  <circle
                    cx={X(m)}
                    cy={Y(p.valores[i])}
                    r={13}
                    fill="transparent"
                    onPointerMove={(e) =>
                      tip.show(
                        e,
                        <>
                          <b>{p.nombre}</b> · mes {m}
                          <br />
                          {fmt(p.valores[i], 2)} {d.unidad} · su rango: {fmt(p.lo, 2)}–{fmt(p.hi, 2)}
                        </>
                      )
                    }
                  />
                </g>
              ))
            )}
            {/* Resultado nuevo (fuera del rango propio) */}
            {people.map((p) => {
              if (!("nuevo" in p) || !p.nuevo) return null;
              const { mes, valor } = p.nuevo;
              const cx = X(mes);
              const cy = Y(valor);
              return (
                <g key={`${p.nombre}-nuevo`}>
                  <line x1={cx} x2={cx} y1={cy + 8} y2={Y(p.hi)} stroke={p.color} strokeDasharray="2 3" />
                  <circle cx={cx} cy={cy} r={6} fill={C.surface} stroke={p.color} strokeWidth={2.5} />
                  <text x={cx - 12} y={cy - 10} textAnchor="end" fontSize={11.5} fill={C.text}>
                    Nuevo resultado: {fmt(valor, 2)}
                  </text>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={14}
                    fill="transparent"
                    onPointerMove={(e) =>
                      tip.show(
                        e,
                        <>
                          <b>{p.nombre}</b> · mes {mes}
                          <br />
                          {fmt(valor, 2)} {d.unidad}: dentro del rango de la población ({fmt(popLo, 1)}–{fmt(popHi, 1)}), fuera del suyo
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
