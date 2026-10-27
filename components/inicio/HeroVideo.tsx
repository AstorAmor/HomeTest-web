"use client";

import { useEffect, useRef, useState } from "react";
import { medir } from "@/lib/medicion";
import { useMenosMovimiento } from "./escenas/animacion";

// Vídeo de fondo de la portada (content/inicio.json → hero.video, hero.video_bucle y hero.video_planos).
// Desde el 27/10/2026 es un carrusel de primeros planos (seis clips de 3,5 s con corte seco) que se
// repite: con `planos`, cada corte avisa a la tarjeta de señales («portada:plano») para que cambie a la
// vez que la imagen. Con bucle, el vídeo principal se ve una vez y se funde con el bucle (así era el
// giro hacia el horizonte de octubre). El vídeo aparece con un fundido sobre la foto. En el móvil se
// usan los recortes verticales, con el mismo nombre acabado en "-movil.mp4". Con "reducir movimiento"
// no hay vídeo y se queda la foto.
const recorteMovil = (src: string) => src.replace(/\.mp4$/, "-movil.mp4");

export default function HeroVideo({ src, bucle, planos = 0 }: { src: string; bucle?: string; planos?: number }) {
  const menos = useMenosMovimiento();
  const [movil, setMovil] = useState<boolean | null>(null);
  const [enBucle, setEnBucle] = useState(false);
  const [listo, setListo] = useState(false);
  const refGiro = useRef<HTMLVideoElement>(null);
  const refBucle = useRef<HTMLVideoElement>(null);
  const medido = useRef(false);

  useEffect(() => setMovil(window.matchMedia("(max-width: 639px)").matches), []);
  // La portada siempre está a la vista al cargar: el giro arranca en cuanto hay vídeo
  useEffect(() => {
    refGiro.current?.play().catch(() => {});
  }, [movil]);

  // Carrusel: en cada corte de plano avisa a la tarjeta de señales y, al dar la primera vuelta entera,
  // lo mide. Se mira en cada fotograma del vídeo (o, si el navegador no deja, unas 4 veces por segundo)
  useEffect(() => {
    const v = refGiro.current;
    if (!v || bucle || planos < 2) return;
    let anterior = 0;
    let id = 0;
    const mirar = () => {
      if (!v.duration) return;
      const plano = Math.min(planos - 1, Math.floor((v.currentTime / v.duration) * planos));
      if (plano === anterior) return;
      if (plano < anterior && !medido.current) {
        medido.current = true;
        medir("video", "carrusel de portada visto entero");
      }
      anterior = plano;
      window.dispatchEvent(new Event("portada:plano"));
    };
    if (typeof v.requestVideoFrameCallback === "function") {
      const cada = () => {
        mirar();
        id = v.requestVideoFrameCallback(cada);
      };
      id = v.requestVideoFrameCallback(cada);
      return () => v.cancelVideoFrameCallback(id);
    }
    v.addEventListener("timeupdate", mirar);
    return () => v.removeEventListener("timeupdate", mirar);
  }, [movil, menos, bucle, planos]);

  if (menos || movil === null) return null;
  const elegir = (s: string) => (movil ? recorteMovil(s) : s);
  // El recorte del móvil ya va centrado en el sujeto; en pantallas anchas, el mismo encuadre que la foto
  const clase = `absolute inset-0 h-full w-full object-cover ${movil ? "object-center" : "object-[60%_60%]"}`;

  const alAcabar = () => {
    if (enBucle) return;
    if (!medido.current) {
      medido.current = true;
      medir("video", "giro de portada visto entero");
    }
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
        // El bucle arranca debajo 0,8 s antes de que acabe el giro y el giro se desvanece encima: así el
        // fundido es entre dos vídeos en movimiento, sin que el mar se congele ni asome la foto de fondo
        className={`${clase} transition-opacity duration-700 ${enBucle || !listo ? "opacity-0" : ""}`}
        src={elegir(src)}
        muted
        autoPlay
        loop={!bucle}
        playsInline
        preload="auto"
        onPlaying={() => setListo(true)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (bucle && v.duration - v.currentTime < 0.8) alAcabar();
        }}
        onEnded={bucle ? alAcabar : undefined}
        aria-hidden
      />
    </>
  );
}
