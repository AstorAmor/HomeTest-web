"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Escena } from "@/lib/content";
import { LADO, useEnPantalla, useMenosMovimiento } from "./escenas/animacion";
import EscenaContexto, { type DatosContexto } from "./escenas/EscenaContexto";
import EscenaWearables, { type DatosWearables } from "./escenas/EscenaWearables";
import EscenaDiario, { type DatosDiario } from "./escenas/EscenaDiario";
import EscenaAnalitica, { type DatosAnalitica } from "./escenas/EscenaAnalitica";
import EscenaEntiende, { type DatosEntiende } from "./escenas/EscenaEntiende";
import EscenaPlan, { type DatosPlan } from "./escenas/EscenaPlan";
import EscenaTendencia, { type DatosTendencia } from "./escenas/EscenaTendencia";

// Imagen de cada paso de "Cómo funciona": foto (con un zoom muy lento) o vídeo en bucle, y encima
// una escena animada de cristal que se reproduce mientras está a la vista. Las escenas no son
// capturas de la app: son ilustraciones con datos de ejemplo (content/inicio.json → "escena").
export default function Escenario({
  imagen,
  alt,
  video,
  encuadre,
  escena,
}: {
  imagen: string;
  alt: string;
  video: string | null;
  encuadre: string;
  escena: Escena;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const activa = useEnPantalla(ref);

  // En el móvil la tarjeta cuelga por debajo de la foto (hueco de pb-[30%]) para no tapar caras;
  // en pantallas más anchas va dentro de la foto, al lado contrario de la persona ("lado").
  return (
    <div ref={ref} className="escena relative pb-[30%] sm:pb-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-bg-soft shadow-[0_30px_60px_-30px_rgb(14_42_36/0.35)] sm:aspect-[6/5]">
        <Image
          src={imagen}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 560px, 100vw"
          className={`object-cover ${video ? "" : "deriva"}`}
          style={{ objectPosition: encuadre }}
        />
        {video && <VideoBucle src={video} poster={imagen} encuadre={encuadre} activa={activa} />}
        {/* Velo muy suave para que el cristal destaque sobre fotos claras */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </div>
      <div
        aria-hidden
        className={`escena-ui absolute inset-x-0 bottom-0 flex justify-center px-[5%] sm:inset-0 sm:items-center sm:p-[5%] ${LADO[escena.lado] ?? "sm:justify-center"}`}
      >
        <EscenaSegunTipo escena={escena} activa={activa} />
      </div>
    </div>
  );
}

function EscenaSegunTipo({ escena, activa }: { escena: Escena; activa: boolean }) {
  const datos = escena as unknown;
  switch (escena.tipo) {
    case "contexto":
      return <EscenaContexto datos={datos as DatosContexto} activa={activa} />;
    case "wearables":
      return <EscenaWearables datos={datos as DatosWearables} activa={activa} />;
    case "diario":
      return <EscenaDiario datos={datos as DatosDiario} activa={activa} />;
    case "analitica":
      return <EscenaAnalitica datos={datos as DatosAnalitica} activa={activa} />;
    case "entiende":
      return <EscenaEntiende datos={datos as DatosEntiende} activa={activa} />;
    case "plan":
      return <EscenaPlan datos={datos as DatosPlan} activa={activa} />;
    case "tendencia":
      return <EscenaTendencia datos={datos as DatosTendencia} activa={activa} />;
    default:
      return null;
  }
}

// Vídeo mudo en bucle que solo se reproduce a la vista (y nunca con "reducir movimiento": entonces
// se queda la foto, que es su primer fotograma).
export function VideoBucle({
  src,
  poster,
  encuadre,
  activa,
  className = "",
}: {
  src: string;
  poster: string;
  encuadre?: string;
  activa: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const menos = useMenosMovimiento();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (activa && !menos) v.play().catch(() => {});
    else v.pause();
  }, [activa, menos]);

  if (menos) return null;
  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      style={encuadre ? { objectPosition: encuadre } : undefined}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
}
