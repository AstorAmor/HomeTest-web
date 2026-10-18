import Link from "next/link";
import Container from "../ui/Container";
import Reveal from "../landing/Reveal";
import Escenario from "./Escenario";
import type { Inicio, Paso } from "@/lib/content";
import { localePath, type Lang } from "@/lib/i18n";

// "Cómo funciona": siete pasos, cada uno con el texto a la izquierda y su escena animada a la
// derecha (en el móvil, la escena debajo). Textos e imágenes en content/inicio.json → "pasos".
export default function Pasos({ copy, lang }: { copy: Inicio; lang: Lang }) {
  const { pasos_intro, pasos } = copy;
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-bg">
      <Container>
        <Reveal className="mx-auto max-w-2xl pb-6 pt-20 text-center sm:pt-28">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light">{pasos_intro.eyebrow}</p>
          <h2 className="mt-4 text-balance font-display text-4xl font-normal tracking-tight text-text sm:text-6xl">{pasos_intro.titulo}</h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-text-muted">{pasos_intro.subtitulo}</p>
        </Reveal>

        <ol>
          {pasos.map((paso, i) => (
            <li key={paso.id} id={paso.id} className="scroll-mt-20 border-b border-border/70 py-14 last:border-0 sm:py-20 lg:py-24">
              <FilaPaso paso={paso} n={i + 1} etiquetaPaso={pasos_intro.paso} lang={lang} />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function FilaPaso({ paso, n, etiquetaPaso, lang }: { paso: Paso; n: number; etiquetaPaso: string; lang: Lang }) {
  const proximamente = "proximamente" in paso ? paso.proximamente : null;
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.12fr] lg:gap-16">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-light sm:text-sm">
          {etiquetaPaso} {String(n).padStart(2, "0")} <span aria-hidden>·</span> {paso.etiqueta}
        </p>
        <h3 className="mt-4 text-balance font-display text-4xl font-normal leading-[1.08] tracking-tight text-text sm:text-5xl">{paso.titulo}</h3>
        <p className="mt-5 max-w-lg text-lg text-text-muted">{paso.texto}</p>
        <ul className="mt-6 space-y-2.5">
          {paso.puntos.map((punto) => (
            <li key={punto} className="flex items-start gap-3 text-[15px] text-text">
              <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-accent-light" aria-hidden>
                <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6.3 10.2l2.4 2.4 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {punto}
            </li>
          ))}
        </ul>
        {/* Lo que todavía no está disponible: una frase en condicional, discreta, sin aspecto de botón */}
        {proximamente && (
          <p className="mt-6 flex max-w-lg items-center gap-3 font-display text-lg italic text-accent-light">
            <span aria-hidden className="h-px w-8 shrink-0 bg-gold" />
            {proximamente}
          </p>
        )}
        {paso.cta && (
          <div className="mt-8">
            <Link
              href={localePath(lang, "/#lista-de-espera")}
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              {paso.cta}
            </Link>
          </div>
        )}
      </Reveal>

      <Reveal delay={120}>
        <Escenario imagen={paso.imagen} alt={paso.imagen_alt} video={paso.video} encuadre={paso.encuadre} escena={paso.escena} />
      </Reveal>
    </div>
  );
}
