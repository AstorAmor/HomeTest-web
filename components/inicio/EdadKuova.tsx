"use client";

import Image from "next/image";
import { useRef } from "react";
import Container from "../ui/Container";
import Reveal from "../landing/Reveal";
import { Contador, useEnPantalla } from "./escenas/animacion";
import type { Inicio } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

// "Tu edad KUOVA": el mismo medallón que la app (las capas de la marca recortadas en círculo, con el
// aro dorado; arte en hometest-app/assets/images/kuova-age). Al verse, el número baja de la edad
// real a la edad KUOVA y después aparece la diferencia. Las cifras son un ejemplo
// (content/inicio.json → "edad").
export default function EdadKuova({ copy, lang }: { copy: Inicio["edad"]; lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null);
  const activa = useEnPantalla(ref, 0.5);

  return (
    <section id="edad-kuova" className="scroll-mt-20 bg-bg-soft py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-light sm:text-sm">{copy.eyebrow}</p>
            <h2 className="mt-4 text-balance font-display text-4xl font-normal leading-[1.08] tracking-tight text-text sm:text-5xl">{copy.titulo}</h2>
            <p className="mt-5 max-w-lg text-lg text-text-muted">{copy.texto}</p>
            <ul className="mt-6 space-y-2.5">
              {copy.puntos.map((punto) => (
                <li key={punto} className="flex items-start gap-3 text-[15px] text-text">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-accent-light" aria-hidden>
                    <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M6.3 10.2l2.4 2.4 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {punto}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-text-muted">{copy.nota}</p>
          </Reveal>

          <div ref={ref} className="flex flex-col items-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
              {copy.titulo_medallon} <span className="font-semibold normal-case tracking-normal">· {copy.ejemplo}</span>
            </p>
            <div
              className={`relative mt-4 aspect-square w-[min(78vw,340px)] transition-[transform,opacity] duration-1000 ease-out ${
                activa ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-full shadow-[0_30px_60px_-30px_rgb(14_42_36/0.45)]">
                <Image src={copy.imagen} alt="" fill sizes="340px" className="giro-lento object-cover" />
              </div>
              {/* Aro dorado, como en la app */}
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <linearGradient id="kuova-aro" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#B8904F" stopOpacity="1" />
                    <stop offset="0.5" stopColor="#B8904F" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#B8904F" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="98.6" fill="none" stroke="url(#kuova-aro)" strokeWidth="2" />
                <circle cx="100" cy="100" r="94.5" fill="none" stroke="#B8904F" strokeOpacity="0.35" strokeWidth="0.8" />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-[clamp(3.6rem,19vw,5.8rem)] font-extrabold tabular-nums tracking-tight text-accent [text-shadow:0_1px_10px_rgb(255_255_255/0.9)]">
                <Contador
                  desde={copy.edad_real}
                  hasta={copy.edad_kuova}
                  activo={activa}
                  duracion={2200}
                  decimales={1}
                  idioma={lang === "es" ? "es-ES" : "en-GB"}
                />
              </span>
            </div>
            <p
              className={`mt-5 text-lg font-extrabold text-[#9C7A42] transition-[opacity,transform] duration-700 ${
                activa ? "translate-y-0 opacity-100 delay-[2000ms]" : "translate-y-2 opacity-0"
              }`}
            >
              {copy.diferencia}
            </p>
            <p className={`mt-1 text-sm text-text-muted transition-opacity duration-700 ${activa ? "opacity-100 delay-[2300ms]" : "opacity-0"}`}>
              {copy.edad_real_texto}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
