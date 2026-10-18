"use client";

import { VideoBucle } from "./Escenario";

// Vídeo de fondo de la portada (content/inicio.json → hero.video). La portada siempre está a la
// vista al cargar, así que se reproduce directamente; con "reducir movimiento" se queda la foto.
export default function HeroVideo({ src, poster }: { src: string; poster: string }) {
  // Mismo encuadre que la foto de components/inicio/Portada.tsx
  return <VideoBucle src={src} poster={poster} activa className="object-[72%_60%] sm:object-[60%_60%]" />;
}
