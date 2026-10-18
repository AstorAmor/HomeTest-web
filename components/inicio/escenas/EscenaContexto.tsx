"use client";

import { escalon, useFases } from "./animacion";

export interface DatosContexto {
  pregunta: string;
  opciones: string[];
  elegida: number;
  objetivos_titulo: string;
  objetivos: string[];
}

// Paso "Cuéntanos": aparece una pregunta del cuestionario, se elige una respuesta y después
// se van marcando los objetivos.
const FASES = [700, 1300, 1400, 4200] as const;

export default function EscenaContexto({ datos, activa }: { datos: DatosContexto; activa: boolean }) {
  const { fase } = useFases(activa, FASES);

  return (
    <div className="flex w-[68%] flex-col gap-[0.8em] sm:w-[62%]">
      <div className="vidrio entra p-[1.15em]" data-on={fase >= 1}>
        <p className="font-display text-[1.3em] leading-snug">{datos.pregunta}</p>
        <div className="mt-[0.9em] flex flex-wrap gap-[0.45em]">
          {datos.opciones.map((opcion, i) => (
            <span key={opcion} className="opcion" data-elegida={fase >= 2 && i === datos.elegida}>
              {opcion}
            </span>
          ))}
        </div>
      </div>

      <div className="vidrio entra p-[1.15em]" data-on={fase >= 3}>
        <p className="etiqueta-escena">{datos.objetivos_titulo}</p>
        <ul className="mt-[0.7em] space-y-[0.45em]">
          {datos.objetivos.map((objetivo, i) => (
            <li key={objetivo} className="entra flex items-center gap-[0.6em]" data-on={fase >= 3} style={escalon(fase >= 3, i, 260, 250)}>
              <span className="check" data-on={fase >= 3} />
              <span className="text-[0.95em] font-medium">{objetivo}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
