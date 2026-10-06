"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// Fondo del hero: vídeo en bucle si hay uno (content/site-copy.json → home.hero.video,
// fichero en public/videos/) y, mientras no lo haya, la foto con un zoom muy lento.
// El vídeo se puede pausar (accesibilidad) y no se reproduce si el usuario prefiere menos movimiento.
export default function HeroMedia({
  image,
  video,
  pauseLabel,
  playLabel,
}: {
  image: string;
  video: string | null;
  pauseLabel: string;
  playLabel: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <div aria-hidden={!video} className="absolute inset-0 overflow-hidden">
      {video ? (
        <>
          <video
            ref={ref}
            className="h-full w-full object-cover object-top motion-reduce:hidden"
            src={video}
            poster={image}
            autoPlay
            muted
            loop
            playsInline
          />
          <Image src={image} alt="" fill priority sizes="100vw" className="hidden object-cover object-top motion-reduce:block" />
          <button
            type="button"
            onClick={toggle}
            aria-label={paused ? playLabel : pauseLabel}
            className="absolute bottom-6 right-6 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 motion-reduce:hidden"
          >
            {paused ? "▶" : "❚❚"}
          </button>
        </>
      ) : (
        <Image src={image} alt="" fill priority sizes="100vw" className="kenburns object-cover object-top" />
      )}
    </div>
  );
}
