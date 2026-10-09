import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/knowledge/ArticleBody";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import { getArticle, getArticles } from "@/lib/knowledge";
import { KNOWLEDGE } from "@/lib/launch";
import { SITE_URL } from "@/lib/seo";

// Un artículo de /conocimiento. El texto está en content/conocimiento/<slug>.md.

export function generateStaticParams() {
  return KNOWLEDGE ? getArticles().map((a) => ({ slug: a.slug })) : [];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!KNOWLEDGE || !a) return {};
  const url = `/conocimiento/${a.slug}`;
  const image = `${SITE_URL}/images/kuova-og.jpg`;
  return {
    title: `${a.titulo} · Kuova Health`,
    description: a.descripcion,
    alternates: { canonical: url },
    robots: a.estado === "borrador" ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      siteName: "Kuova Health",
      title: a.titulo,
      description: a.descripcion,
      url,
      locale: "es_ES",
      publishedTime: a.fecha,
      images: [{ url: image, width: 1200, height: 630, alt: a.titulo }],
    },
    twitter: { card: "summary_large_image", title: a.titulo, description: a.descripcion, images: [image] },
  };
}

const longDate = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "";

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!KNOWLEDGE || !a) notFound();

  return (
    <article lang="es" className="bg-bg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.titulo,
          description: a.descripcion,
          inLanguage: "es",
          datePublished: a.fecha,
          url: `${SITE_URL}/conocimiento/${a.slug}`,
          image: `${SITE_URL}/images/kuova-og.jpg`,
          author: { "@id": `${SITE_URL}/#organization` },
          publisher: { "@id": `${SITE_URL}/#organization` },
          citation: a.refs.map((r) => r.text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*/g, "")),
        }}
      />
      <header className="border-b border-border bg-bg-soft">
        <Container>
          <div className="mx-auto max-w-[44rem] pb-12 pt-28 sm:pb-16 sm:pt-36">
            {a.estado === "borrador" && (
              <p className="mb-6 inline-block rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-accent-light">
                Borrador · pendiente de revisión médica · no se publica
              </p>
            )}
            <p className="text-sm text-text-muted">
              <Link href="/conocimiento" className="font-logo font-semibold uppercase tracking-[0.14em] text-accent-light hover:text-accent">
                Conocimiento
              </Link>
              {a.categoria && <span className="ml-2 text-text-muted">· {a.categoria}</span>}
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-text sm:text-[3.4rem]">
              {a.titulo}
            </h1>
            {a.subtitulo && <p className="mt-5 text-balance text-lg leading-relaxed text-text-muted sm:text-xl">{a.subtitulo}</p>}
            <p className="mt-6 text-sm text-text-muted">
              {longDate(a.fecha)}
              {a.lectura && <> · {a.lectura} de lectura</>}
            </p>
          </div>
        </Container>
      </header>
      <Container>
        <div className="mx-auto max-w-[44rem] pb-24 pt-6 sm:pb-32">
          <ArticleBody article={a} />
        </div>
      </Container>
    </article>
  );
}
