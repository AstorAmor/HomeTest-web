import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/components/knowledge/ArticleLayout";
import Relacionados from "@/components/knowledge/Relacionados";
import { faqsOf, getArticle, getArticles, plain } from "@/lib/knowledge";
import { SITE_URL } from "@/lib/seo";

// Una comparativa: Kuova frente a otra app o marca (texto en content/comparativas/<slug>.md).
// Solo en español. Se enlazan desde el pie de página, no desde el menú.

export function generateStaticParams() {
  return getArticles("comparativas").map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug, "comparativas");
  if (!a) return {};
  const url = `/comparativas/${a.slug}`;
  const image = `${SITE_URL}/images/kuova-og.jpg`;
  return {
    title: `${a.titulo} · Kuova Health`,
    description: a.descripcion,
    alternates: { canonical: url },
    robots: a.estado === "borrador" ? { index: false, follow: false } : undefined,
    openGraph: { type: "article", siteName: "Kuova Health", title: a.titulo, description: a.descripcion, url, locale: "es_ES", images: [{ url: image, width: 1200, height: 630, alt: a.titulo }] },
    twitter: { card: "summary_large_image", title: a.titulo, description: a.descripcion, images: [image] },
  };
}

export default function ComparativaPage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug, "comparativas");
  if (!a) notFound();
  const url = `${SITE_URL}/comparativas/${a.slug}`;
  const faqs = faqsOf(a);
  const otras = getArticles("comparativas").filter((o) => o.slug !== a.slug && o.estado === "publicado");

  return (
    <ArticleLayout
      article={a}
      section={{ label: "Comparativas", href: "/comparativas" }}
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: a.titulo,
          description: a.descripcion,
          inLanguage: "es",
          url,
          dateModified: a.revisado ?? a.fecha,
          publisher: { "@id": `${SITE_URL}/#organization` },
          citation: a.refs.map((r) => plain(r.text)),
        },
        ...(faqs.length
          ? [
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.pregunta, acceptedAnswer: { "@type": "Answer", text: f.respuesta } })),
              },
            ]
          : []),
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Kuova Health", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Comparativas", item: `${SITE_URL}/comparativas` },
            { "@type": "ListItem", position: 3, name: a.titulo, item: url },
          ],
        },
      ]}
    >
      <Relacionados
        titulo="Otras comparativas"
        items={otras.map((o) => ({ href: `/comparativas/${o.slug}`, label: o.titulo }))}
        cierre={{
          titulo: "Tus datos de siempre, con tus análisis al lado",
          texto: "Kuova se lanza en España. Apúntate y te avisamos en cuanto puedas empezar.",
        }}
      />
    </ArticleLayout>
  );
}
