import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/components/knowledge/ArticleLayout";
import Relacionados from "@/components/knowledge/Relacionados";
import { faqsOf, getArticle, getArticles, plain } from "@/lib/knowledge";
import { SITE_URL } from "@/lib/seo";

// Ficha de un biomarcador (texto en content/biomarcadores/<slug>.md): qué es, cómo se interpreta,
// qué lo cambia y cómo prepararse, con las cifras de guías y organismos oficiales citadas.
// No se dice que lo haya revisado un médico (no se puede afirmar todavía, ver el brief de marca).

export function generateStaticParams() {
  return getArticles("biomarcadores").map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug, "biomarcadores");
  if (!a) return {};
  const url = `/biomarcadores/${a.slug}`;
  const image = `${SITE_URL}/images/kuova-og.jpg`;
  return {
    title: a.meta.titulo_seo ?? `${a.titulo}: qué es y valores normales · Kuova Health`,
    description: a.descripcion,
    alternates: { canonical: url },
    robots: a.estado === "borrador" ? { index: false, follow: false } : undefined,
    openGraph: { type: "article", siteName: "Kuova Health", title: a.titulo, description: a.descripcion, url, locale: "es_ES", images: [{ url: image, width: 1200, height: 630, alt: a.titulo }] },
    twitter: { card: "summary_large_image", title: a.titulo, description: a.descripcion, images: [image] },
  };
}

export default function BiomarcadorPage({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug, "biomarcadores");
  if (!a) notFound();
  const url = `${SITE_URL}/biomarcadores/${a.slug}`;
  const faqs = faqsOf(a);
  const todos = getArticles("biomarcadores").filter((o) => o.slug !== a.slug && o.estado === "publicado");
  // Primero los de la misma familia, luego el resto
  const otros = [...todos.filter((o) => o.categoria === a.categoria), ...todos.filter((o) => o.categoria !== a.categoria)].slice(0, 6);

  return (
    <ArticleLayout
      article={a}
      section={{ label: "Biomarcadores", href: "/biomarcadores" }}
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: a.titulo,
          description: a.descripcion,
          inLanguage: "es",
          url,
          datePublished: a.fecha,
          lastReviewed: a.revisado ?? a.fecha,
          audience: { "@type": "Patient" },
          about: {
            "@type": "MedicalTest",
            name: a.titulo,
            ...(a.meta.otros_nombres ? { alternateName: a.meta.otros_nombres.split(",").map((s) => s.trim()) } : {}),
          },
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
            { "@type": "ListItem", position: 2, name: "Biomarcadores", item: `${SITE_URL}/biomarcadores` },
            { "@type": "ListItem", position: 3, name: a.titulo, item: url },
          ],
        },
      ]}
    >
      <Relacionados
        titulo="Otros biomarcadores"
        items={otros.map((o) => ({ href: `/biomarcadores/${o.slug}`, label: o.titulo, texto: o.categoria }))}
        cierre={{
          titulo: "Mide, entiende y vuelve a medir",
          texto: "Con Kuova tus análisis quedan junto a tu historial, explicados con claridad. Apúntate y te avisamos del lanzamiento en España.",
        }}
      />
    </ArticleLayout>
  );
}
