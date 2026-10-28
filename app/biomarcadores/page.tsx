import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import { FAMILIAS, getArticles } from "@/lib/knowledge";
import { SITE_URL } from "@/lib/seo";

// Índice de /biomarcadores: las fichas de content/biomarcadores/*.md, agrupadas por familia
// (el campo "categoria" de cada ficha, en el orden de FAMILIAS en lib/knowledge.ts) y, dentro de
// cada familia, en su orden ("orden").

export function generateMetadata(): Metadata {
  return {
    title: "Biomarcadores: qué mide cada análisis y cómo se interpreta · Kuova Health",
    description:
      "Qué significa cada valor de tu análisis de sangre (hemograma, hierro, colesterol, glucosa, tiroides…): sus rangos según las guías y qué los cambia.",
    alternates: { canonical: "/biomarcadores" },
  };
}

export default function BiomarcadoresIndex() {
  const fichas = getArticles("biomarcadores");
  const lugar = (f: string) => (FAMILIAS.includes(f) ? FAMILIAS.indexOf(f) : FAMILIAS.length);
  const familias = Array.from(new Set(fichas.map((f) => f.categoria ?? "Otros"))).sort((a, b) => lugar(a) - lugar(b));

  return (
    <div lang="es" className="bg-bg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Biomarcadores",
          inLanguage: "es",
          url: `${SITE_URL}/biomarcadores`,
          hasPart: fichas.map((a) => ({ "@type": "MedicalWebPage", name: a.titulo, url: `${SITE_URL}/biomarcadores/${a.slug}` })),
        }}
      />
      <header className="border-b border-border bg-bg-soft">
        <Container>
          <div className="max-w-2xl pb-12 pt-28 sm:pb-16 sm:pt-36">
            <p className="font-logo text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">Biomarcadores</p>
            <h1 className="mt-4 text-balance font-display text-4xl font-medium tracking-tight text-text sm:text-6xl">
              Qué dice cada análisis
            </h1>
            <p className="mt-5 text-balance text-lg text-text-muted">
              Qué mide cada marcador, cómo se interpreta según las guías y organismos oficiales, qué lo hace subir o bajar y cómo
              prepararte para el análisis. Con las fuentes citadas en cada ficha.
            </p>
          </div>
        </Container>
      </header>
      <Container>
        <div className="space-y-12 py-14 sm:py-20">
          {familias.map((familia) => (
            <section key={familia} aria-labelledby={`familia-${familia}`}>
              <h2 id={`familia-${familia}`} className="font-display text-2xl font-medium text-text">
                {familia}
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fichas
                  .filter((f) => (f.categoria ?? "Otros") === familia)
                  .map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/biomarcadores/${a.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/30"
                      >
                        <span className="font-display text-xl leading-snug text-text group-hover:text-accent">{a.titulo}</span>
                        <span className="mt-2 text-sm text-text-muted">{a.subtitulo}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="pb-20 text-sm text-text-muted">
          Contenido informativo basado en guías clínicas y organismos oficiales. Los valores de referencia cambian según el
          laboratorio y la técnica: usa siempre los de tu informe. No sustituye la valoración de un profesional sanitario.
        </p>
      </Container>
    </div>
  );
}
