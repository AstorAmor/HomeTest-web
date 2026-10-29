import Link from "next/link";
import type { ReactNode } from "react";
import { longDate } from "./ArticleLayout";
import { Antetitulo, Bloques, Referencias } from "./ArticleBody";
import GraficosKuova from "./GraficosKuova";
import JsonLd from "@/components/seo/JsonLd";
import Container from "@/components/ui/Container";
import type { Article, Block } from "@/lib/knowledge";
import { NEWSLETTER } from "@/lib/launch";

// La versión web de un número de Kuova Letter (/conocimiento/<slug>), a la que lleva el botón «Ver los
// gráficos interactivos» del email: el mismo texto y las mismas secciones que el email, con los gráficos
// interactivos y las fuentes enlazadas. Como en el email (y en construir_numero.py), «Dato curioso» y
// «Mito o realidad» van en una caja, y «Desde Kuova» lleva la despedida.

const CAJAS = ["Dato curioso", "Mito o realidad"];

type H2 = Extract<Block, { type: "h2" | "h3" }>;

export default function NumeroLayout({ article: a, jsonLd = [], children }: { article: Article; jsonLd?: object[]; children?: ReactNode }) {
  // «El tema» es lo que va antes del primer ##; luego, una sección por cada ##
  const secciones: { h2?: H2; blocks: Block[] }[] = [{ blocks: [] }];
  for (const b of a.blocks) {
    if (b.type === "h2") secciones.push({ h2: b, blocks: [] });
    else secciones[secciones.length - 1].blocks.push(b);
  }

  return (
    <article key={a.slug} lang="es" className="kuova-letter bg-bg">
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
            <p className="font-logo text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">
              {NEWSLETTER ? (
                <Link href="/newsletter" className="hover:text-accent">
                  Kuova Letter
                </Link>
              ) : (
                "Kuova Letter"
              )}{" "}
              · n.º {a.meta.numero}
              {a.meta.mes && <> · {a.meta.mes}</>}
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
        <div className="mx-auto max-w-[44rem] pb-16 pt-6 sm:pb-20">
          {a.meta.imagen && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.meta.imagen}
              alt={a.meta.imagen_alt ?? ""}
              width={1200}
              height={600}
              className="mb-4 mt-4 aspect-[2/1] h-auto w-full rounded-2xl object-cover sm:mt-8"
            />
          )}
          <div className="text-[1.0625rem] leading-[1.75] text-text/90">
            {secciones.map(({ h2, blocks }, i) => {
              if (!h2) return <Bloques key={i} blocks={blocks} article={a} />;
              const etiqueta = h2.kicker ?? h2.text;
              const caja = CAJAS.includes(etiqueta);
              return (
                <section key={i} aria-labelledby={h2.id} className={caja ? "mt-14 rounded-2xl bg-bg-soft px-5 pb-7 pt-6 sm:px-8" : "mt-14"}>
                  {h2.kicker ? (
                    <h2
                      id={h2.id}
                      className={`scroll-mt-28 font-display font-medium leading-tight text-text ${caja ? "text-2xl" : "text-[1.75rem] sm:text-[2rem]"}`}
                    >
                      <Antetitulo text={h2.kicker} />
                      {h2.text}
                    </h2>
                  ) : (
                    // Sección sin titular («Una cosa para estos días», «Desde Kuova»): solo la etiqueta
                    <h2 id={h2.id} className="scroll-mt-28 font-logo text-xs font-semibold uppercase tracking-[0.14em] text-accent-light">
                      {h2.text}
                    </h2>
                  )}
                  <Bloques blocks={blocks} article={a} />
                  {etiqueta === "Desde Kuova" && (
                    <p className="mt-6">
                      Hasta la próxima,
                      <br />
                      <span className="font-display text-xl text-text">El equipo de Kuova</span>
                    </p>
                  )}
                </section>
              );
            })}
            {a.refs.length > 0 && <Referencias refs={a.refs} titulo="Fuentes" />}
            <p className="mt-8 text-sm text-text-muted">Esta newsletter es informativa y no sustituye el consejo de tu médico.</p>
          </div>
        </div>
        {children && <div className="mx-auto max-w-[44rem] pb-24 sm:pb-32">{children}</div>}
      </Container>
      <GraficosKuova />
    </article>
  );
}
