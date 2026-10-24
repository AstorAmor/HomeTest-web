import Image from "next/image";
import Link from "next/link";
import Container from "../ui/Container";
import HeroVideo from "./HeroVideo";
import Senales from "./Senales";
import type { Inicio } from "@/lib/content";
import { localePath, type Lang } from "@/lib/i18n";

// En Playfair cursiva la T, U, V, W e Y empiezan ~0,11 em más a la derecha que las rectas: sin
// compensarlo, «Vive mejor.» parece sangrado respecto a la primera línea del titular.
const CURSIVAS_CON_AIRE = "TUÚVWY";

// Portada: foto (o vídeo) a pantalla completa con el cielo libre para el titular, que va en verde
// sobre un velo crema; abajo a la derecha, una tarjeta de cristal con "tus señales" que van cambiando.
export default function Portada({ copy, lang }: { copy: Inicio["hero"]; lang: Lang }) {
  const conAire = CURSIVAS_CON_AIRE.includes(copy.titulo_2.trim().charAt(0));
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-bg-soft">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={copy.imagen}
          alt={copy.imagen_alt}
          fill
          priority
          sizes="100vw"
          className={`object-cover object-[72%_60%] sm:object-[60%_60%] ${copy.video ? "" : "deriva-lenta"}`}
        />
        {copy.video && <HeroVideo src={copy.video} bucle={copy.video_bucle || undefined} />}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-bg/85 via-bg/50 to-transparent sm:bg-gradient-to-r sm:from-bg/80 sm:via-bg/30" />
      </div>

      <Container>
        <div className="max-w-2xl pb-10 pt-32 sm:pt-44">
          <p className="aparece-arriba inline-flex rounded-full border border-accent/15 bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent-light backdrop-blur">
            {copy.eyebrow}
          </p>
          <h1 className="aparece-arriba mt-6 font-display text-[3.3rem] font-normal leading-[1] tracking-tight text-accent [animation-delay:120ms] sm:text-7xl lg:text-[5.5rem]">
            {copy.titulo}
            <span className={`block italic text-accent-light ${conAire ? "-ml-[0.11em]" : ""}`}>{copy.titulo_2}</span>
          </h1>
          <p className="aparece-arriba mt-6 max-w-xl text-balance text-lg text-text/80 [animation-delay:240ms] sm:text-xl">{copy.subtitulo}</p>
          <div className="aparece-arriba mt-9 flex flex-col gap-3 [animation-delay:360ms] sm:flex-row">
            <Link
              href={localePath(lang, "/#lista-de-espera")}
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              {copy.cta}
            </Link>
            <Link
              href={localePath(lang, "/#como-funciona")}
              className="inline-flex items-center justify-center rounded-full border border-accent/20 bg-white/40 px-7 py-3.5 text-sm font-semibold text-accent backdrop-blur transition-colors hover:bg-white/70"
            >
              {copy.cta_2}
            </Link>
          </div>
        </div>
      </Container>

      <div className="mt-auto">
        <Container>
          <div className="flex justify-end pb-8 sm:pb-12">
            <Senales titulo={copy.senales_titulo} senales={copy.senales} />
          </div>
        </Container>
      </div>
    </section>
  );
}
