import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import FormularioNewsletter from "@/components/newsletter/FormularioNewsletter";
import JsonLd from "@/components/seo/JsonLd";
import Container from "@/components/ui/Container";
import textos from "@/content/newsletter.json";
import { getLang } from "@/lib/i18n";
import { NEWSLETTER } from "@/lib/launch";
import { SITE_URL } from "@/lib/seo";

// kuovahealth.com/newsletter: qué es Kuova Letter, qué temas trae y el alta (el mismo formulario que
// al final de las guías). Para enlazarla desde redes, la firma o el pie de la web. Solo en español:
// /en/newsletter lleva aquí. Textos en content/newsletter.json → «pagina».
const p = textos.pagina;

export function generateMetadata(): Metadata {
  if (!NEWSLETTER) return {};
  return {
    title: p.titulo_seo,
    description: p.descripcion,
    alternates: { canonical: "/newsletter" },
    openGraph: { type: "website", siteName: "Kuova Health", title: p.titulo_seo, description: p.descripcion, url: "/newsletter", locale: "es_ES" },
  };
}

export default function Newsletter() {
  if (!NEWSLETTER) notFound();
  if (getLang() === "en") permanentRedirect("/newsletter");

  return (
    <div lang="es" className="bg-bg">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: p.titulo_seo,
          description: p.descripcion,
          inLanguage: "es",
          url: `${SITE_URL}/newsletter`,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          publisher: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      <header className="border-b border-border bg-bg-soft">
        <Container>
          <div className="max-w-2xl pb-12 pt-28 sm:pb-16 sm:pt-36">
            <p className="font-logo text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">{p.eyebrow}</p>
            <h1 className="mt-4 text-balance font-display text-4xl font-medium tracking-tight text-text sm:text-6xl">{p.titulo}</h1>
            <p className="mt-5 text-balance text-lg text-text-muted">{p.texto}</p>
          </div>
        </Container>
      </header>
      <Container>
        <div className="max-w-3xl space-y-14 py-12 sm:space-y-16 sm:py-16">
          <FormularioNewsletter sinCabecera className="" />

          <section aria-labelledby="que-te-llega">
            <h2 id="que-te-llega" className="font-display text-3xl font-medium text-text">
              {p.que_titulo}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {p.que.map((q) => (
                <li key={q.titulo} className="rounded-2xl border border-border bg-surface p-5">
                  <span className="font-medium text-text">{q.titulo}</span>
                  <span className="mt-1.5 block text-sm text-text-muted">{q.texto}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="temas">
            <h2 id="temas" className="font-display text-3xl font-medium text-text">
              {p.temas_titulo}
            </h2>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-text marker:text-gold">
              {p.temas.map((t) => (
                <li key={t} className="pl-1">
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="ejemplo" className="rounded-2xl bg-bg-soft p-6 sm:p-8">
            <h2 id="ejemplo" className="font-display text-2xl font-medium text-text">
              {p.ejemplo_titulo}
            </h2>
            <p className="mt-2 text-text-muted">{p.ejemplo_texto}</p>
            <Link href={p.ejemplo_href} className="mt-4 inline-block font-medium text-accent-light underline underline-offset-2 hover:text-accent">
              {p.ejemplo_enlace}
            </Link>
          </section>
        </div>
      </Container>
    </div>
  );
}
