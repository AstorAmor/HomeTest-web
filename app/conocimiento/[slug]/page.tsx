import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/components/knowledge/ArticleLayout";
import NumeroLayout from "@/components/knowledge/NumeroLayout";
import FormularioNewsletter from "@/components/newsletter/FormularioNewsletter";
import { esNumero, getArticle, getArticles, paginaVisible, plain } from "@/lib/knowledge";
import { NEWSLETTER } from "@/lib/launch";
import { SITE_URL } from "@/lib/seo";

// Un artículo de /conocimiento. El texto está en content/conocimiento/<slug>.md. Los números de Kuova
// Letter (los importa scripts/importar-numero.mjs) se pintan como su email, con NumeroLayout.
// Solo existen los artículos generados al compilar: cualquier otra dirección da 404. Sin esto, con la
// sección oculta (lista vacía) kuovahealth.com respondía 500 en vez de 404. Qué se ve y cuándo:
// paginaVisible en lib/knowledge.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles()
    .filter(paginaVisible)
    .map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!a || !paginaVisible(a)) return {};
  const url = `/conocimiento/${a.slug}`;
  // Imagen al compartir: «imagen_og» (la portada de Kuova Letter en PNG, 1200 × 600) o «imagen»
  const image = `${SITE_URL}${a.meta.imagen_og ?? a.meta.imagen ?? "/images/kuova-og.jpg"}`;
  const size = a.meta.imagen_og ? { width: 1200, height: 600 } : { width: 1200, height: 630 };
  return {
    title: a.meta.titulo_seo ?? `${a.titulo} · Kuova Health`,
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
      images: [{ url: image, ...size, alt: a.meta.imagen_alt ?? a.titulo }],
    },
    twitter: { card: "summary_large_image", title: a.titulo, description: a.descripcion, images: [image] },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!a || !paginaVisible(a)) notFound();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.titulo,
      description: a.descripcion,
      inLanguage: "es",
      datePublished: a.fecha,
      url: `${SITE_URL}/conocimiento/${a.slug}`,
      image: `${SITE_URL}${a.meta.imagen_og ?? a.meta.imagen ?? "/images/kuova-og.jpg"}`,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      citation: a.refs.map((r) => plain(r.text)),
    },
  ];

  if (esNumero(a))
    return (
      <NumeroLayout article={a} jsonLd={jsonLd}>
        {NEWSLETTER && <FormularioNewsletter />}
      </NumeroLayout>
    );

  return (
    <ArticleLayout article={a} section={{ label: "Conocimiento", href: "/conocimiento" }} jsonLd={jsonLd}>
      {NEWSLETTER && <FormularioNewsletter />}
    </ArticleLayout>
  );
}
