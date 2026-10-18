import Container from "../ui/Container";
import Reveal from "../landing/Reveal";
import FaqAccordion from "../home/FaqAccordion";
import SilkBackground from "../prelaunch/SilkBackground";
import FormularioEspera from "./FormularioEspera";
import type { Inicio } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

// Secciones sencillas de la portada, después de "Cómo funciona". Textos en content/inicio.json.

// Frase grande entre la portada y los pasos
export function Intro({ copy }: { copy: Inicio["intro"] }) {
  return (
    <section id="intro" className="scroll-mt-20 bg-bg">
      <Container>
        <Reveal className="mx-auto max-w-4xl pt-24 text-center sm:pt-32">
          <h2 className="text-balance font-display text-4xl font-normal leading-[1.1] tracking-tight text-text sm:text-6xl">
            {copy.titulo} <span className="italic text-accent-light">{copy.destacado}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-text-muted sm:text-xl">{copy.texto}</p>
        </Reveal>
      </Container>
    </section>
  );
}

const ICONOS = [
  // Europa: globo
  <path key="eu" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.5 2.4 3.8 5.4 3.8 9s-1.3 6.6-3.8 9m0-18C9.5 5.4 8.2 8.4 8.2 12s1.3 6.6 3.8 9M3.5 9h17M3.5 15h17" />,
  // Nunca a la venta: escudo
  <path key="escudo" d="M12 3l7 3v5.5c0 4.3-3 7.9-7 9.5-4-1.6-7-5.2-7-9.5V6l7-3Zm-3 9l2.2 2.2L15.5 10" />,
  // Tú decides: interruptor
  <path key="interruptor" d="M8 7h8a5 5 0 0 1 0 10H8A5 5 0 0 1 8 7Zm8 2.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Z" />,
];

export function Privacidad({ copy }: { copy: Inicio["datos"] }) {
  return (
    <section id="privacidad" className="scroll-mt-20 bg-bg-soft py-20 sm:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light">{copy.eyebrow}</p>
          <h2 className="mt-4 font-display text-4xl font-normal tracking-tight text-text sm:text-5xl">{copy.titulo}</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {copy.puntos.map((punto, i) => (
            <Reveal key={punto.titulo} delay={i * 90} className="h-full">
              <div className="h-full rounded-3xl border border-border bg-bg p-7">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-accent-light" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {ICONOS[i % ICONOS.length]}
                </svg>
                <h3 className="mt-5 text-lg font-semibold text-text">{punto.titulo}</h3>
                <p className="mt-2 text-text-muted">{punto.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm text-text-muted">{copy.nota}</p>
      </Container>
    </section>
  );
}

export function Preguntas({ copy }: { copy: Inicio["preguntas"] }) {
  return (
    <section id="preguntas" className="scroll-mt-20 bg-bg py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <h2 className="font-display text-4xl font-normal tracking-tight text-text sm:text-5xl">{copy.titulo}</h2>
            <p className="mt-5 text-text-muted">
              {copy.subtitulo}{" "}
              <a href={`mailto:${copy.email}`} className="font-medium text-accent-light underline decoration-accent-light/30 underline-offset-4 hover:text-accent">
                {copy.email}
              </a>
            </p>
          </Reveal>
          <FaqAccordion preguntas={copy.lista} />
        </div>
      </Container>
    </section>
  );
}

// Cierre con la lista de espera, sobre la misma seda verde de la página de pre-lanzamiento
export function ListaEspera({ copy, lang }: { copy: Inicio["lista"]; lang: Lang }) {
  return (
    <section id="lista-de-espera" className="relative isolate scroll-mt-20 overflow-hidden bg-ink py-24 text-on-accent sm:py-32">
      <div className="absolute inset-0 -z-10">
        <SilkBackground />
      </div>
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-balance font-display text-4xl font-normal tracking-tight sm:text-6xl">{copy.titulo}</h2>
          <p className="mx-auto mt-5 max-w-md text-balance text-lg text-on-accent/75">{copy.texto}</p>
          <div className="mt-10 text-left">
            <FormularioEspera copy={copy} lang={lang} />
          </div>
        </div>
      </Container>
    </section>
  );
}
