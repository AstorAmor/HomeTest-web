import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import FormularioNewsletter from "@/components/newsletter/FormularioNewsletter";
import copy from "@/content/aprende.json";
import { getArticles, hrefOf, leadOf } from "@/lib/knowledge";
import { NEWSLETTER } from "@/lib/launch";
import { SITE_URL } from "@/lib/seo";

// /aprende: el índice de todo lo que se puede leer en la web (guías, fichas de biomarcadores y
// comparativas), el alta en la newsletter Kuova Letter y los temas que se aprenden dentro de la app.
// Textos en content/aprende.json.

export function generateMetadata(): Metadata {
  return {
    title: "Aprende: guías de longevidad, salud preventiva, ciclo, dieta y ejercicio · Kuova Health",
    description:
      "Guías con fuentes sobre longevidad, salud preventiva, edad biológica, análisis de sangre, ciclo menstrual, alimentación y ejercicio, fichas de biomarcadores y comparativas con las apps de salud que ya usas.",
    alternates: { canonical: "/aprende" },
  };
}

const tarjeta = "group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/30";
const chip = "inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm text-text transition-colors hover:border-accent/30 hover:text-accent";

export default function Aprende() {
  const publicado = <T extends { estado: string }>(a: T) => a.estado === "publicado";
  const guias = getArticles("guias").filter(publicado);
  const fichas = getArticles("biomarcadores").filter(publicado);
  const comparativas = getArticles("comparativas").filter(publicado);

  return (
    <div lang="es" className="bg-bg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Aprende",
          description: copy.texto,
          inLanguage: "es",
          url: `${SITE_URL}/aprende`,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          publisher: { "@id": `${SITE_URL}/#organization` },
          hasPart: [
            ...guias.map((a) => ({ "@type": "MedicalWebPage", name: a.titulo, url: `${SITE_URL}${hrefOf("guias", a.slug)}` })),
            ...fichas.map((a) => ({ "@type": "MedicalWebPage", name: a.titulo, url: `${SITE_URL}${hrefOf("biomarcadores", a.slug)}` })),
            ...comparativas.map((a) => ({ "@type": "WebPage", name: a.titulo, url: `${SITE_URL}${hrefOf("comparativas", a.slug)}` })),
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Kuova Health", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Aprende", item: `${SITE_URL}/aprende` },
          ],
        }}
      />
      <header className="border-b border-border bg-bg-soft">
        <Container>
          <div className="max-w-2xl pb-12 pt-28 sm:pb-16 sm:pt-36">
            <p className="font-logo text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">{copy.eyebrow}</p>
            <h1 className="mt-4 text-balance font-display text-4xl font-medium tracking-tight text-text sm:text-6xl">{copy.titulo}</h1>
            <p className="mt-5 text-balance text-lg text-text-muted">{copy.texto}</p>
          </div>
        </Container>
      </header>
      <Container>
        <div className="space-y-16 py-14 sm:space-y-20 sm:py-20">
          <section aria-labelledby="guias">
            <h2 id="guias" className="font-display text-3xl font-medium text-text">
              {copy.guias_titulo}
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {guias.map((a) => (
                <li key={a.slug}>
                  <Link href={hrefOf("guias", a.slug)} className={tarjeta}>
                    <span className="font-display text-xl leading-snug text-text group-hover:text-accent">{a.titulo}</span>
                    <span className="mt-2 line-clamp-3 text-sm text-text-muted">{leadOf(a)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {NEWSLETTER && (
            <div className="max-w-3xl">
              <FormularioNewsletter className="" />
              <Link href="/newsletter" className="mt-3 inline-block text-sm font-medium text-accent-light underline underline-offset-2 hover:text-accent">
                Qué es Kuova Letter y qué temas trae
              </Link>
            </div>
          )}

          <section aria-labelledby="fichas">
            <h2 id="fichas" className="font-display text-3xl font-medium text-text">
              {copy.biomarcadores_titulo}
            </h2>
            <p className="mt-3 max-w-2xl text-text-muted">{copy.biomarcadores_texto}</p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {fichas.map((a) => (
                <li key={a.slug}>
                  <Link href={hrefOf("biomarcadores", a.slug)} className={chip}>
                    {a.titulo}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/biomarcadores" className="mt-5 inline-block text-sm font-medium text-accent-light underline underline-offset-2 hover:text-accent">
              {copy.biomarcadores_cta}
            </Link>
          </section>

          <section aria-labelledby="comparativas">
            <h2 id="comparativas" className="font-display text-3xl font-medium text-text">
              {copy.comparativas_titulo}
            </h2>
            <p className="mt-3 max-w-2xl text-text-muted">{copy.comparativas_texto}</p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {comparativas.map((a) => (
                <li key={a.slug}>
                  <Link href={hrefOf("comparativas", a.slug)} className={chip}>
                    {a.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="en-la-app">
            <h2 id="en-la-app" className="font-display text-3xl font-medium text-text">
              {copy.app_titulo}
            </h2>
            <p className="mt-3 max-w-2xl text-text-muted">{copy.app_texto}</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {copy.temas_app.map((t) => (
                <li key={t.titulo} className="flex h-full flex-col rounded-2xl border border-border bg-bg-soft p-5">
                  <span className="font-medium text-text">{t.titulo}</span>
                  <span className="mt-1.5 text-sm text-text-muted">{t.texto}</span>
                  {t.href && (
                    <Link href={t.href} className="mt-3 text-sm font-medium text-accent-light underline underline-offset-2 hover:text-accent">
                      {copy.app_enlace}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <p className="pb-20 text-sm text-text-muted">
          Contenido informativo basado en guías clínicas, organismos oficiales y estudios publicados, con las fuentes citadas en cada
          página. No sustituye la valoración de un profesional sanitario.
        </p>
      </Container>
    </div>
  );
}
