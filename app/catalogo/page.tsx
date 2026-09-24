import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import { bloquesBiomarcadores, getTotalBiomarcadores, siteCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: siteCopy.seo.catalogo.title,
  description: siteCopy.seo.catalogo.description,
};

export default function CatalogoPage() {
  const { pagina_catalogo } = siteCopy;

  return (
    <>
      <PageHero
        title={pagina_catalogo.titulo_hero}
        subtitle={`${pagina_catalogo.subtitulo_hero} En total, ${getTotalBiomarcadores()} biomarcadores.`}
      />

      {bloquesBiomarcadores.map((bloque, index) => (
        <Section key={bloque.bloque_id} soft={index % 2 === 1}>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-text sm:text-3xl">
              {bloque.titulo}
            </h2>
            <p className="mt-2 text-text-muted">{bloque.descripcion}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {bloque.biomarcadores.map((biomarcador) => (
              <div
                key={biomarcador.id}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <h3 className="font-semibold text-text">{biomarcador.nombre}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent-light">
                  Muestra: {biomarcador.muestra}
                </p>
                <p className="mt-3 text-sm text-text-muted">
                  {biomarcador.explicacion}
                </p>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
