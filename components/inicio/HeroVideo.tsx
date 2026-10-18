"use client";

import { useEffect, useRef, useState } from "react";
import { medir } from "@/lib/medicion";
import { useMenosMovimiento } from "./escenas/animacion";

// Vídeo de fondo de la portada (content/inicio.json → hero.video y hero.video_bucle): primero el
// giro de cámara alrededor de la chica, una sola vez, y al acabar un bucle tranquilo (olas, pelo,
// hierba) que empieza en el último fotograma del giro, así que no se nota el cambio. Sin bucle, el
// vídeo principal se repite. En el móvil se usan los recortes verticales, con el mismo nombre
// acabado en "-movil.mp4". Con "reducir movimiento" no hay vídeo y se queda la foto.
const recorteMovil = (src: string) => src.replace(/\.mp4$/, "-movil.mp4");

export default function HeroVideo({ src, bucle }: { src: string; bucle?: string }) {
  const menos = useMenosMovimiento();
  const [movil, setMovil] = useState<boolean | null>(null);
  const [enBucle, setEnBucle] = useState(false);
  const refGiro = useRef<HTMLVideoElement>(null);
  const refBucle = useRef<HTMLVideoElement>(null);

  useEffect(() => setMovil(window.matchMedia("(max-width: 639px)").matches), []);
  // La portada siempre está a la vista al cargar: el giro arranca en cuanto hay vídeo
  useEffect(() => {
    refGiro.current?.play().catch(() => {});
  }, [movil]);

  if (menos || movil === null) return null;
  const elegir = (s: string) => (movil ? recorteMovil(s) : s);
  // El recorte del móvil ya va centrado en la chica; en pantallas anchas, el mismo encuadre que la foto
  const clase = `absolute inset-0 h-full w-full object-cover ${movil ? "object-center" : "object-[60%_60%]"}`;

  const alAcabar = () => {
    medir("video", "giro de portada visto entero");
    const v = refBucle.current;
    // Si el bucle no ha cargado, se queda el último fotograma del giro (mejor que volver a la foto)
    if (!v || v.readyState < 2) return;
    v.currentTime = 0;
    v.play().catch(() => {});
    setEnBucle(true);
  };

  return (
    <>
      {bucle && (
        <video
          ref={refBucle}
          className={`${clase} ${enBucle ? "" : "opacity-0"}`}
          src={elegir(bucle)}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
      )}
      <video
        ref={refGiro}
        // El bucle aparece debajo de golpe y el giro se desvanece encima: un fundido corto por si el
        // primer fotograma del bucle no es idéntico al último del giro (sin que asome la foto de fondo)
        className={`${clase} transition-opacity duration-700 ${enBucle ? "opacity-0" : ""}`}
        src={elegir(src)}
        muted
        autoPlay
        loop={!bucle}
        playsInline
        preload="auto"
        onEnded={bucle ? alAcabar : undefined}
        aria-hidden
      />
    </>
  );
}
