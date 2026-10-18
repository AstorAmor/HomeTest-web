"use client";

import { useEffect, useState } from "react";
import { useMenosMovimiento } from "./escenas/animacion";

// Tarjeta de la portada: una señal cada vez (reloj, registro, analítica, plan), que se cambia por
// la siguiente subiendo suavemente. Con "reducir movimiento" se ven todas, quietas.
export default function Senales({ titulo, senales }: { titulo: string; senales: { fuente: string; texto: string }[] }) {
  const menos = useMenosMovimiento();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (menos) return;
    const t = setInterval(() => setI((n) => (n + 1) % senales.length), 2800);
    return () => clearInterval(t);
  }, [menos, senales.length]);

  return (
    <div className="aparece-arriba w-full max-w-[22rem] rounded-3xl border border-white/70 bg-white/55 p-5 shadow-[0_20px_50px_-25px_rgb(14_42_36/0.45)] backdrop-blur-xl [animation-delay:600ms]">
      <div className="flex items-center gap-2">
        <span className="latido h-2 w-2 rounded-full bg-[#5f9a7c]" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-light">{titulo}</p>
      </div>
      {menos ? (
        <ul className="mt-3 space-y-2">
          {senales.map((s) => (
            <li key={s.texto} className="text-sm">
              <span className="text-text-muted">{s.fuente} · </span>
              <span className="font-medium text-text">{s.texto}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative mt-3 h-12 overflow-hidden" aria-live="off">
          {senales.map((s, n) => (
            <div key={s.texto} className="senal absolute inset-0" data-estado={n === i ? "actual" : n === (i - 1 + senales.length) % senales.length ? "sale" : "espera"}>
              <p className="text-xs text-text-muted">{s.fuente}</p>
              <p className="mt-0.5 font-medium text-text">{s.texto}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
