import Button from "../ui/Button";
import Container from "../ui/Container";
import HeroMedia from "./HeroMedia";
import type { SiteCopy } from "@/lib/content";
import { localePath, type Lang } from "@/lib/i18n";

// Portada a pantalla completa: foto/vídeo de fondo y la frase principal.
export default function Hero({ copy, lang }: { copy: SiteCopy; lang: Lang }) {
  const { hero } = copy.home;
  return (
    <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-ink text-white">
      <HeroMedia image={hero.imagen} video={hero.video} pauseLabel={copy.ui.pausar} playLabel={copy.ui.reproducir} />
      {/* Degradado para que el texto se lea sobre cualquier imagen */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
      <Container>
        <div className="relative pb-16 pt-40 sm:pb-24">
          <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur">
            {hero.eyebrow}
          </p>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.02] tracking-tight sm:text-7xl lg:text-8xl">
            {hero.titulo}
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-white/85 sm:text-xl">{hero.subtitulo}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href={localePath(lang, "/#lista-de-espera")} variant="cream">
              {hero.cta_principal}
            </Button>
            <Button href={localePath(lang, "/#como-funciona")} variant="light">
              {hero.cta_secundaria}
            </Button>
          </div>
          <p className="mt-6 text-xs text-white/60">{hero.nota_legal}</p>
        </div>
      </Container>
    </section>
  );
}
