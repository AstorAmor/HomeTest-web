import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import { getArticles, leadOf } from "@/lib/knowledge";
import { SITE_URL } from "@/lib/seo";

// Índice de /comparativas: Kuova frente a las apps de salud y wearables más usadas en España.

export function generateMetadata(): Metadata {
  return {
    title: "Kuova frente a Apple Salud, Oura, Garmin y más · Kuova Health",
    description:
      "En qué se diferencia Kuova de las apps de tu reloj o tu anillo y cómo se complementan: preguntas y respuestas claras sobre Apple Salud, Google Health, Oura, Garmin, Huawei Health y WHOOP.",
    alternates: { canonical: "/comparativas" },
  };
}

export default function ComparativasIndex() {
  const items = getArticles("comparativas");

  return (
    <div lang="es" className="bg-bg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Comparativas",
          inLanguage: "es",
          url: `${SITE_URL}/comparativas`,
          hasPart: items.map((a) => ({ "@type": "WebPage", name: a.titulo, url: `${SITE_URL}/comparativas/${a.slug}` })),
        }}
      />
      <header className="border-b border-border bg-bg-soft">
        <Container>
          <div className="max-w-2xl pb-12 pt-28 sm:pb-16 sm:pt-36">
            <p className="font-logo text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">Comparativas</p>
            <h1 className="mt-4 text-balance font-display text-4xl font-medium tracking-tight text-text sm:text-6xl">
              Kuova y las apps que ya usas
            </h1>
            <p className="mt-5 text-balance text-lg text-text-muted">
              Tu reloj o tu anillo miden cómo duermes, cuánto te mueves y cómo late tu corazón. Kuova añade lo que no ven: tus análisis de sangre, cómo te sientes y un plan. Aquí tienes en qué se diferencian y cómo se complementan.
            </p>
          </div>
        </Container>
      </header>
      <Container>
        <ul className="grid gap-5 py-14 sm:grid-cols-2 sm:py-20">
          {items.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/comparativas/${a.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/30"
              >
                <span className="font-display text-2xl leading-snug text-text group-hover:text-accent">{a.titulo}</span>
                <span className="mt-2 line-clamp-3 text-text-muted">{leadOf(a)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="pb-20 text-sm text-text-muted">
          Información pública de cada marca, consultada en las fechas que indica cada página. Las marcas citadas pertenecen a sus
          titulares; Kuova no está afiliada a ellas.
        </p>
      </Container>
    </div>
  );
}
