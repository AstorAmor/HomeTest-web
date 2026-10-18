"use client";

import { useFases } from "./animacion";

export interface DatosDiario {
  titulo: string;
  hora: string;
  energia: string;
  animo: string;
  digestion: string;
  digestion_opciones: string[];
  ciclo_fase: string;
  ciclo_dia: number;
  ciclo_duracion: number;
  ciclo_valor: string;
  ciclo_nota: string;
}

// Paso "Registra": el registro del día se rellena fila a fila (energía, ánimo, digestión) y al
// final aparece el ciclo como en la app: la barra con sus cuatro fases y el día de hoy marcado.
const FASES = [700, 900, 800, 800, 800, 1300, 3600] as const;

const ENERGIA = 4;
const ANIMO = 4;
const DIGESTION = 0;

// Colores de las fases del ciclo, los mismos que la app (hometest-app/src/utils/cyclePhase.ts)
const COLOR_FASE = { menstrual: "#E06B9E", folicular: "#9B8CFF", ovulacion: "#3ECDB8", lutea: "#F0B84D" };

function Puntos({ total = 5, llenos, on, color }: { total?: number; llenos: number; on: boolean; color: string }) {
  return (
    <span className="flex gap-[0.3em]">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-[0.7em] w-[0.7em] rounded-full transition-colors duration-300"
          style={{ backgroundColor: on && i < llenos ? color : "rgb(14 42 36 / 0.1)", transitionDelay: on ? `${i * 90}ms` : "0ms" }}
        />
      ))}
    </span>
  );
}

// Barra del ciclo con las cuatro fases (misma aproximación que la app: ovulación unos 14 días
// antes del siguiente periodo) y un marcador en el día actual.
function BarraCiclo({ dia, duracion, on }: { dia: number; duracion: number; on: boolean }) {
  const ovulacion = Math.max(10, duracion - 14);
  const tramos = [
    { color: COLOR_FASE.menstrual, dias: 5 },
    { color: COLOR_FASE.folicular, dias: ovulacion - 2 - 5 },
    { color: COLOR_FASE.ovulacion, dias: 3 },
    { color: COLOR_FASE.lutea, dias: duracion - (ovulacion + 1) },
  ];
  return (
    <div className="relative mt-[0.5em]">
      <div className="flex h-[0.5em] gap-[0.15em]">
        {tramos.map((t, i) => (
          <span key={i} className="rounded-full" style={{ flex: Math.max(1, t.dias), backgroundColor: t.color, opacity: 0.55 }} />
        ))}
      </div>
      <span
        className="absolute top-1/2 h-[1.1em] w-[0.25em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-text transition-[left,opacity] duration-[1100ms] ease-out"
        style={{ left: `${(on ? (dia - 0.5) / duracion : 0) * 100}%`, opacity: on ? 1 : 0 }}
      />
    </div>
  );
}

export default function EscenaDiario({ datos, activa }: { datos: DatosDiario; activa: boolean }) {
  const { fase } = useFases(activa, FASES);
  const fila = "flex items-center justify-between gap-[0.8em] py-[0.5em]";
  const nombre = "text-[0.85em] text-text-muted";

  return (
    <div className="vidrio entra w-[74%] p-[1.2em] sm:w-[44%]" data-on={fase >= 1}>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-[1.35em]">{datos.titulo}</p>
        <p className="text-[0.75em] tabular-nums text-text-muted">{datos.hora}</p>
      </div>

      <div className="mt-[0.5em] divide-y divide-accent/10">
        <div className={fila}>
          <span className={nombre}>{datos.energia}</span>
          <Puntos llenos={ENERGIA} on={fase >= 2} color="#0E2A24" />
        </div>
        <div className={fila}>
          <span className={nombre}>{datos.animo}</span>
          <Puntos llenos={ANIMO} on={fase >= 3} color="#C9A36B" />
        </div>
        {/* Digestión: la etiqueta arriba y las tres opciones debajo, a todo el ancho */}
        <div className="py-[0.5em]">
          <span className={nombre}>{datos.digestion}</span>
          <span className="mt-[0.4em] flex gap-[0.3em]">
            {datos.digestion_opciones.map((opcion, i) => (
              <span key={opcion} className="opcion opcion-mini flex-1 text-center" data-elegida={fase >= 4 && i === DIGESTION}>
                {opcion}
              </span>
            ))}
          </span>
        </div>
        <div className="entra pt-[0.55em]" data-on={fase >= 5}>
          <div className="flex items-baseline justify-between gap-[0.6em]">
            <span className="text-[0.85em] font-semibold text-[#6f5fd6]">{datos.ciclo_fase}</span>
            <span className="text-[0.72em] tabular-nums text-text-muted">{datos.ciclo_valor}</span>
          </div>
          <BarraCiclo dia={datos.ciclo_dia} duracion={datos.ciclo_duracion} on={fase >= 5} />
          <p className="mt-[0.55em] text-[0.74em] leading-snug text-text-muted">{datos.ciclo_nota}</p>
        </div>
      </div>
    </div>
  );
}
