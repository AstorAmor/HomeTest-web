import type { ComponentType } from "react";
import type { Article } from "@/lib/knowledge";
import Inline from "./Inline";
import Rangos from "./Rangos";
import Regla from "./Regla";
import Tabla from "./Tabla";
import IndividualityChart from "./charts/IndividualityChart";
import KineticsChart from "./charts/KineticsChart";
import OutOfRangeChart from "./charts/OutOfRangeChart";
import RcvChart from "./charts/RcvChart";

// Gráficas que se pueden poner en un artículo con [[grafica:nombre]] (datos en
// content/conocimiento/datos.json). Para una nueva: crear el componente y añadirlo aquí.
const CHARTS: Record<string, ComponentType> = {
  individualidad: IndividualityChart,
  "fuera-de-rango": OutOfRangeChart,
  vrc: RcvChart,
  tiempos: KineticsChart,
};

export default function ArticleBody({ article }: { article: Article }) {
  return (
    <div className="text-[1.0625rem] leading-[1.75] text-text/90">
      {article.blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} id={b.id} className="mt-14 scroll-mt-28 font-display text-[1.75rem] font-medium leading-tight text-text sm:text-[2rem]">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={b.id} className="mt-10 scroll-mt-28 text-xl font-semibold text-text">
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="mt-5">
                <Inline text={b.text} />
              </p>
            );
          case "quote":
            return (
              <p key={i} className="my-7 rounded-xl bg-bg-soft px-5 py-4 text-center font-display text-xl text-text sm:text-2xl">
                <Inline text={b.text} />
              </p>
            );
          case "ul":
          case "ol": {
            const List = b.type;
            return (
              <List key={i} className={`mt-5 space-y-3 pl-5 ${b.type === "ul" ? "list-disc" : "list-decimal"} marker:text-gold`}>
                {b.items.map((it, j) => (
                  <li key={j} className="pl-1">
                    <Inline text={it} />
                  </li>
                ))}
              </List>
            );
          }
          case "table":
            return b.rangos ? <Rangos key={i} head={b.head} rows={b.rows} /> : <Tabla key={i} head={b.head} rows={b.rows} />;
          case "regla":
            return article.regla ? (
              <Regla key={i} regla={article.regla} ficha={article.slug} />
            ) : (
              <p key={i} className="my-6 rounded-lg border border-dashed border-border p-4 text-sm text-text-muted">
                Falta el bloque «regla:» en la cabecera de esta ficha, o le falta la unidad, los extremos o algún tramo.
              </p>
            );
          case "image":
            return (
              <figure key={i} className="my-9">
                {/* <img> y no next/image: las imágenes de los artículos tienen tamaños distintos y muchas son SVG */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.src} alt={b.alt} loading="lazy" className="h-auto w-full rounded-xl border border-border bg-bg-soft" />
                {b.caption && (
                  <figcaption className="mt-3 text-sm leading-relaxed text-text-muted">
                    <Inline text={b.caption} />
                  </figcaption>
                )}
              </figure>
            );
          case "chart": {
            const Chart = CHARTS[b.id];
            return Chart ? (
              <Chart key={i} />
            ) : (
              <p key={i} className="my-6 rounded-lg border border-dashed border-border p-4 text-sm text-text-muted">
                Falta la gráfica «{b.id}» (las disponibles: {Object.keys(CHARTS).join(", ")}).
              </p>
            );
          }
        }
      })}

      {article.refs.length > 0 && (
        <section aria-labelledby="referencias" className="mt-16 border-t border-border pt-8">
          <h2 id="referencias" className="font-display text-2xl font-medium text-text">
            Referencias
          </h2>
          <ol className="mt-5 space-y-2.5 pl-5 text-sm leading-relaxed text-text-muted">
            {article.refs.map((r) => (
              <li key={r.id} id={`ref-${r.id}`} value={Number(r.id) || undefined} className="scroll-mt-28 pl-1">
                <Inline text={r.text} />{" "}
                <a href={`#cita-${r.id}`} aria-label="Volver al texto" className="text-accent-light no-underline">
                  ↩
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
