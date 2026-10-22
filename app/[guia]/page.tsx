import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ArticleLayout from "@/components/knowledge/ArticleLayout";
import Relacionados from "@/components/knowledge/Relacionados";
import FormularioNewsletter from "@/components/newsletter/FormularioNewsletter";
import { faqsOf, getArticle, getArticles, hrefOf, plain } from "@/lib/knowledge";
import { getLang } from "@/lib/i18n";
import { NEWSLETTER } from "@/lib/launch";
import { SITE_URL } from "@/lib/seo";

// Guía larga en la raíz de la web (/longevidad, /salud-preventiva...), con el texto en
// content/guias/<slug>.md. Solo existen las guías que hay en esa carpeta: cualquier otra dirección
// da 404. Las páginas fijas (/privacy, /biomarcadores, /aprende...) tienen prioridad sobre esta.
export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles("guias").map((a) => ({ guia: a.slug }));
}

export function generateMetadata({ params }: { params: { guia: string } }): Metadata {
  const a = getArticle(params.guia, "guias");
  if (!a) return {};
  const url = hrefOf("guias", a.slug);
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
      modifiedTime: a.revisado ?? a.fecha,
      images: [{ url: image, width: 1200, height: 630, alt: a.titulo }],
    },
    twitter: { card: "summary_large_image", title: a.titulo, description: a.descripcion, images: [image] },
  };
}

export default function GuiaPage({ params }: { params: { guia: string } }) {
  const a = getArticle(params.guia, "guias");
  if (!a) notFound();
  // Las guías solo están en español: /en/longevidad lleva a /longevidad
  if (getLang() === "en") permanentRedirect(hrefOf("guias", a.slug));

  const url = `${SITE_URL}${hrefOf("guias", a.slug)}`;
  const faqs = faqsOf(a);
  const otras = getArticles("guias").filter((o) => o.slug !== a.slug && o.estado === "publicado");
  // Fichas de biomarcadores que cita la guía (para los datos estructurados)
  const texto = JSON.stringify(a.blocks);
  const fichas = getArticles("biomarcadores").filter((f) => f.estado === "publicado" && texto.includes(`](/biomarcadores/${f.slug})`));
  // El tema de la guía es lo que va antes de los dos puntos del título ("Longevidad: ...")
  const tema = a.titulo.split(":")[0].trim();

  return (
    <ArticleLayout
      article={a}
      section={{ label: "Guías", href: "/aprende" }}
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: a.titulo,
          headline: a.titulo,
          description: a.descripcion,
          inLanguage: "es",
          url,
          ...(a.meta.imagen ? { image: `${SITE_URL}${a.meta.imagen}` } : {}),
          datePublished: a.fecha,
          dateModified: a.revisado ?? a.fecha,
          lastReviewed: a.revisado ?? a.fecha,
          audience: { "@type": "Patient" },
          about: {
            "@type": "Thing",
            name: tema,
            ...(a.meta.otros_nombres ? { alternateName: a.meta.otros_nombres.split(",").map((s) => s.trim()) } : {}),
            ...(a.meta.sameas ? { sameAs: a.meta.sameas } : {}),
          },
          ...(fichas.length
            ? { mentions: fichas.map((f) => ({ "@type": "MedicalTest", name: f.titulo, url: `${SITE_URL}${hrefOf("biomarcadores", f.slug)}` })) }
            : {}),
          isPartOf: { "@id": `${SITE_URL}/#website` },
          author: { "@id": `${SITE_URL}/#organization` },
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
            { "@type": "ListItem", position: 2, name: "Aprende", item: `${SITE_URL}/aprende` },
            { "@type": "ListItem", position: 3, name: a.titulo, item: url },
          ],
        },
      ]}
    >
      {/* Alta en Kuova Letter: aquí llegan los enlaces de la newsletter («Leer en la web») */}
      {NEWSLETTER && <FormularioNewsletter />}
      <Relacionados
        titulo="Otras guías"
        items={otras.map((o) => ({ href: hrefOf("guias", o.slug), label: o.titulo }))}
        secundario={{
          titulo: "Fichas de biomarcadores citadas",
          items: fichas.map((f) => ({ href: hrefOf("biomarcadores", f.slug), label: f.titulo, texto: f.categoria })),
        }}
        cierre={{
          titulo: "Mide lo que haces. Mira lo que cambia.",
          texto: "Kuova junta tus análisis, tu reloj y tu día a día, y te dice qué está funcionando. Apúntate y te avisamos del lanzamiento en España.",
        }}
      />
    </ArticleLayout>
  );
}
