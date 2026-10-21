import Link from "next/link";
import type { ReactNode } from "react";
import ArticleBody from "./ArticleBody";
import JsonLd from "@/components/seo/JsonLd";
import Container from "@/components/ui/Container";
import type { Article } from "@/lib/knowledge";

// Página de un texto largo (artículo, comparativa o ficha de biomarcador): cabecera con la sección,
// título, subtítulo y fechas; el cuerpo con sus referencias; y, debajo, lo que la página añada
// (enlaces relacionados, lista de espera...).

export const longDate = (iso?: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "";

export default function ArticleLayout({
  article: a,
  section,
  jsonLd = [],
  children,
}: {
  article: Article;
  section: { label: string; href: string };
  // Datos estructurados (schema.org) de la página
  jsonLd?: object[];
  children?: ReactNode;
}) {
  return (
    <article lang="es" className="bg-bg">
      {jsonLd.map((d, i) => (
        <JsonLd key={i} data={d} />
      ))}
      <header className="border-b border-border bg-bg-soft">
        <Container>
          <div className="mx-auto max-w-[44rem] pb-12 pt-28 sm:pb-16 sm:pt-36">
            {a.estado === "borrador" && (
              <p className="mb-6 inline-block rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-accent-light">
                Borrador · pendiente de revisión · no se publica
              </p>
            )}
            <nav aria-label="Ruta" className="text-sm text-text-muted">
              <Link href={section.href} className="font-logo font-semibold uppercase tracking-[0.14em] text-accent-light hover:text-accent">
                {section.label}
              </Link>
              {a.categoria && <span className="ml-2 text-text-muted">· {a.categoria}</span>}
            </nav>
            <h1 className="mt-4 text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-text sm:text-[3.4rem]">
              {a.titulo}
            </h1>
            {a.subtitulo && <p className="mt-5 text-balance text-lg leading-relaxed text-text-muted sm:text-xl">{a.subtitulo}</p>}
            <p className="mt-6 text-sm text-text-muted">
              {a.revisado ? <>Revisado el {longDate(a.revisado)} con sus fuentes</> : longDate(a.fecha)}
              {a.lectura && <> · {a.lectura} de lectura</>}
            </p>
          </div>
        </Container>
      </header>
      <Container>
        <div className="mx-auto max-w-[44rem] pb-16 pt-6 sm:pb-20">
          {a.meta.imagen && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.meta.imagen} alt={a.meta.imagen_alt ?? ""} className="mb-4 mt-4 aspect-[16/9] w-full rounded-2xl object-cover sm:mt-8" />
          )}
          <ArticleBody article={a} />
        </div>
        {children && <div className="mx-auto max-w-[44rem] pb-24 sm:pb-32">{children}</div>}
      </Container>
    </article>
  );
}
