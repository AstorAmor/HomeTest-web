import Button from "../ui/Button";
import Container from "../ui/Container";
import { siteCopy } from "@/lib/content";

export default function Hero() {
  const { hero } = siteCopy;

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Resplandor decorativo cálido/azulado, puramente ambiental */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-accent-soft blur-3xl"
      />
      <Container>
        <div className="relative py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-text sm:text-6xl">
              {hero.titulo}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-text-muted sm:text-xl">
              {hero.subtitulo}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href="/#lista-de-espera">{hero.cta_principal}</Button>
              <Button href="/como-funciona" variant="secondary">
                {hero.cta_secundaria}
              </Button>
            </div>
            <p className="mt-6 text-sm text-text-muted">{hero.nota_legal}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
