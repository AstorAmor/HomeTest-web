import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/components/knowledge/ArticleLayout";
import FormularioNewsletter from "@/components/newsletter/FormularioNewsletter";
import { getArticle, getArticles, plain } from "@/lib/knowledge";
import { KNOWLEDGE, NEWSLETTER } from "@/lib/launch";
import { SITE_URL } from "@/lib/seo";

// Un artículo de /conocimiento. El texto está en content/conocimiento/<slug>.md.
// Solo existen los artículos generados al compilar: cualquier otra dirección da 404. Sin esto, con la
// sección oculta (lista vacía) kuovahealth.com respondía 500 en vez de 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return KNOWLEDGE ? getArticles().map((a) => ({ slug: a.slug })) : [];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!KNOWLEDGE || !a) return {};
  const url = `/conocimiento/${a.slug}`;
  const image = `${SITE_URL}${a.meta.imagen ?? "/images/kuova-og.jpg"}`;
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
      images: [{ url: image, width: 1200, height: 630, alt: a.titulo }],
    },
    twitter: { card: "summary_large_image", title: a.titulo, description: a.descripcion, images: [image] },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!KNOWLEDGE || !a) notFound();

  return (
    <ArticleLayout
      article={a}
      section={{ label: "Conocimiento", href: "/conocimiento" }}
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.titulo,
          description: a.descripcion,
          inLanguage: "es",
          datePublished: a.fecha,
          url: `${SITE_URL}/conocimiento/${a.slug}`,
          image: `${SITE_URL}${a.meta.imagen ?? "/images/kuova-og.jpg"}`,
          author: { "@id": `${SITE_URL}/#organization` },
          publisher: { "@id": `${SITE_URL}/#organization` },
          citation: a.refs.map((r) => plain(r.text)),
        },
      ]}
    >
      {NEWSLETTER && <FormularioNewsletter />}
    </ArticleLayout>
  );
}
