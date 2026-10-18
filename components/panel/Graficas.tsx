"use client";

import { useState } from "react";

// Piezas de gráfica del panel (components/panel/Panel.tsx), en HTML sencillo: barras finas con el
// extremo redondeado, rejilla de líneas finas, textos en color de texto (nunca en el de la serie) y
// un recuadro con el dato al pasar por encima. Un color por gráfica: verde para visitas y dorado
// para altas (validados contra el fondo blanco con el comprobador de paletas).
export const VERDE = "#1F7A55";
export const DORADO = "#B8862E";

export const numero = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("es-ES"));
export const porcentaje = (parte: number, total: number) =>
  total > 0 ? `${((100 * parte) / total).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %` : "—";

// Marcas redondas del eje: 0 y dos valores más, sin decimales raros
function marcas(max: number): number[] {
  if (max <= 0) return [0, 1];
  const paso = Math.pow(10, Math.floor(Math.log10(max)));
  const tope = [1, 2, 2.5, 5, 10].map((m) => m * paso).find((t) => t * 2 >= max) ?? paso * 10;
  return [0, tope, tope * 2];
}

// Columnas por día (una serie): rejilla, columnas de hasta 24 px con 2 px de separación y
// recuadro al pasar por encima
export function Columnas({
  datos,
  color,
  nombre,
}: {
  datos: { etiqueta: string; valor: number; detalle?: string }[];
  color: string;
  nombre: string;
}) {
  const [activa, setActiva] = useState<number | null>(null);
  const max = Math.max(0, ...datos.map((d) => d.valor));
  const ejes = marcas(max);
  const tope = ejes[ejes.length - 1];
  const sel = activa != null ? datos[activa] : null;

  return (
    <div className="relative">
      <div className="relative h-40 pl-8">
        {ejes.map((m) => (
          <div key={m} className="absolute left-8 right-0 border-t border-border/70" style={{ bottom: `${(m / tope) * 100}%` }}>
            <span className="absolute -left-8 -translate-y-1/2 text-[11px] tabular-nums text-text-muted">{numero(m)}</span>
          </div>
        ))}
        <div className="absolute inset-y-0 left-8 right-0 flex items-end gap-[2px]" onMouseLeave={() => setActiva(null)}>
          {datos.map((d, i) => (
            <div
              key={d.etiqueta}
              className="flex h-full flex-1 cursor-default items-end justify-center"
              onMouseEnter={() => setActiva(i)}
              onFocus={() => setActiva(i)}
              tabIndex={0}
              aria-label={`${d.etiqueta}: ${numero(d.valor)} ${nombre}`}
            >
              <div
                className="w-full max-w-[24px] rounded-t-[4px] transition-opacity"
                style={{
                  height: d.valor > 0 ? `max(${(d.valor / tope) * 100}%, 2px)` : "0",
                  backgroundColor: color,
                  opacity: activa == null || activa === i ? 1 : 0.45,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex justify-between pl-8 text-[11px] text-text-muted">
        <span>{datos[0]?.etiqueta}</span>
        {datos.length > 2 && <span>{datos[Math.floor(datos.length / 2)]?.etiqueta}</span>}
        <span>{datos[datos.length - 1]?.etiqueta}</span>
      </div>
      {sel && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
          <p className="font-semibold text-text">{sel.etiqueta}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {numero(sel.valor)} {nombre}
            {sel.detalle ? ` · ${sel.detalle}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

// Barras horizontales (una serie), con el valor al final de cada barra y un dato extra a la derecha
export function Barras({
  filas,
  color = VERDE,
  total,
}: {
  filas: { etiqueta: string; valor: number; extra?: string }[];
  color?: string;
  total?: number;
}) {
  const max = Math.max(1, total ?? 0, ...filas.map((f) => f.valor));
  if (!filas.length) return <Vacio />;
  return (
    <ul className="space-y-2.5">
      {filas.map((f) => (
        <li key={f.etiqueta} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,13rem)_1fr_auto]">
          <span className="truncate text-text" title={f.etiqueta}>
            {f.etiqueta}
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-3 rounded-r-[4px]"
              style={{ width: `${Math.max(f.valor > 0 ? 1.5 : 0, (f.valor / max) * 100)}%`, backgroundColor: color }}
            />
            <span className="shrink-0 text-xs tabular-nums text-text">{numero(f.valor)}</span>
          </span>
          <span className="min-w-[3.5rem] text-right text-xs tabular-nums text-text-muted">{f.extra ?? ""}</span>
        </li>
      ))}
    </ul>
  );
}

// Cifra destacada con la comparación con el periodo anterior (flecha + texto, no solo color)
export function Cifra({ etiqueta, valor, anterior, nota }: { etiqueta: string; valor: string; anterior?: { ahora: number; antes: number }; nota?: string }) {
  let cambio: string | null = null;
  if (anterior) {
    const { ahora, antes } = anterior;
    if (antes > 0) {
      const p = ((ahora - antes) / antes) * 100;
      cambio = `${p >= 0 ? "▲" : "▼"} ${Math.abs(p).toLocaleString("es-ES", { maximumFractionDigits: 0 })} % vs periodo anterior`;
    } else if (ahora > 0) cambio = "▲ nuevo (antes 0)";
    else cambio = "sin cambios";
  }
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <p className="text-sm text-text-muted">{etiqueta}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl">{valor}</p>
      {cambio && <p className="mt-1.5 text-xs text-text-muted">{cambio}</p>}
      {nota && <p className="mt-1.5 text-xs text-text-muted">{nota}</p>}
    </div>
  );
}

export function Vacio({ texto = "Aún no hay datos en este periodo." }: { texto?: string }) {
  return <p className="py-6 text-center text-sm text-text-muted">{texto}</p>;
}

export function Tarjeta({ titulo, subtitulo, children, className = "" }: { titulo: string; subtitulo?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-5 sm:p-6 ${className}`}>
      <h2 className="text-base font-semibold text-text">{titulo}</h2>
      {subtitulo && <p className="mt-1 text-sm text-text-muted">{subtitulo}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
