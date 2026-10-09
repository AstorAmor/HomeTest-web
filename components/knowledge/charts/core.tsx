"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

// Piezas comunes de las gráficas de /conocimiento: colores de marca validados (verde y oro
// distinguibles también con daltonismo), marco con título, leyenda, tooltip y tabla de datos.

export const C = {
  s1: "#00805A", // serie 1 (verde)
  s2: "#B5791A", // serie 2 (oro)
  text: "rgb(42 42 42)",
  muted: "rgb(102 99 93)",
  grid: "#EEE8DD",
  axis: "#D9CFBF",
  band: "rgba(14, 42, 36, 0.06)",
  bandEdge: "rgba(14, 42, 36, 0.28)",
  surface: "#FFFFFF",
};

// Números a la española: coma decimal
export const fmt = (n: number, decimals = 0) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

// Barra con la punta redondeada (4 px) y la base recta sobre el eje
export function barPath(x: number, y: number, w: number, h: number, dir: "up" | "right") {
  const r = Math.min(4, dir === "up" ? w / 2 : h / 2, dir === "up" ? h : w);
  if (dir === "up")
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

export interface LegendItem {
  label: string;
  color: string;
  kind?: "dot" | "line" | "band";
}

export interface Tip {
  show: (e: PointerEvent, content: ReactNode) => void;
  hide: () => void;
}

export default function ChartFrame({
  title,
  legend,
  caption,
  table,
  children,
}: {
  title: string;
  legend?: LegendItem[];
  caption?: ReactNode;
  table?: { head: string[]; rows: (string | number)[][] };
  children: (width: number, tip: Tip) => ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [tip, setTip] = useState<{ x: number; y: number; content: ReactNode } | null>(null);

  // El SVG se dibuja al ancho real: así el texto conserva su tamaño también en el móvil
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = (w: number) => setWidth(Math.max(280, Math.round(w)));
    measure(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const api: Tip = {
    show: (e, content) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      setTip({ x: e.clientX - r.left, y: e.clientY - r.top, content });
    },
    hide: () => setTip(null),
  };

  return (
    <figure className="not-prose my-10 rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <figcaption className="text-[0.95rem] font-semibold leading-snug text-text">{title}</figcaption>
      {legend && legend.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.8rem] text-text-muted">
          {legend.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-2">
              {l.kind === "band" ? (
                <i className="inline-block h-3 w-5 rounded-sm" style={{ background: l.color, border: `1px dashed ${C.bandEdge}` }} />
              ) : l.kind === "line" ? (
                <i className="inline-block h-0.5 w-5 rounded" style={{ background: l.color }} />
              ) : (
                <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              )}
              {l.label}
            </span>
          ))}
        </div>
      )}
      <div ref={box} className="relative mt-4 select-none" onPointerLeave={api.hide}>
        {children(width, api)}
        {tip && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 max-w-[260px] rounded-xl border border-border bg-surface px-3 py-2 text-[0.8rem] leading-snug text-text shadow-lg"
            style={{
              left: Math.min(tip.x + 14, width - 230),
              top: tip.y + 14,
            }}
          >
            {tip.content}
          </div>
        )}
      </div>
      {caption && <p className="mt-4 text-[0.8rem] leading-relaxed text-text-muted">{caption}</p>}
      {table && (
        <details className="mt-3 text-[0.8rem] text-text-muted">
          <summary className="cursor-pointer select-none hover:text-text">Ver los datos</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-left tabular-nums">
              <thead>
                <tr>
                  {table.head.map((h) => (
                    <th key={h} className="border-b border-border py-1.5 pr-4 font-semibold text-text">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((c, j) => (
                      <td key={j} className="border-b border-border/60 py-1.5 pr-4">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </figure>
  );
}
