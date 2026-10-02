import Image from "next/image";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "./Reveal";
import type { SiteCopy } from "@/lib/content";

interface Testimonio {
  cita: string;
  nombre: string;
  cargo: string;
  foto?: string;
}

// Profesionales: las especialidades con foto y, cuando haya opiniones REALES y con permiso de
// cada profesional, sus citas (home.profesionales.testimonios en content/site-copy.json).
// Mientras la lista esté vacía, esa parte no se muestra: nunca publicar citas inventadas.
export default function Professionals({ copy }: { copy: SiteCopy }) {
  const { profesionales } = copy.home;
  const testimonios = profesionales.testimonios as Testimonio[];
  return (
    <section className="bg-bg py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={profesionales.eyebrow} title={profesionales.titulo} subtitle={profesionales.subtitulo} />
        </Reveal>

        <div className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {profesionales.roles.map((r, i) => (
            <Reveal key={r.rol} delay={i * 80} className="w-[60vw] max-w-[240px] shrink-0 snap-center sm:w-auto sm:max-w-none">
              <figure className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                <Image src={r.foto} alt="" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 60vw" className="object-cover" />
                <figcaption className="absolute inset-x-3 bottom-3 rounded-full bg-bg/90 px-4 py-2 text-center text-sm font-semibold text-text backdrop-blur">
                  {r.rol}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {testimonios.length > 0 && (
          <div className="mt-16">
            <h3 className="font-display text-3xl font-medium text-text">{profesionales.testimonios_titulo}</h3>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {testimonios.map((t) => (
                <figure key={t.nombre} className="rounded-3xl border border-border bg-surface p-7">
                  <blockquote className="font-display text-xl leading-snug text-text">“{t.cita}”</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-semibold text-text">{t.nombre}</span>
                    <span className="block text-text-muted">{t.cargo}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
