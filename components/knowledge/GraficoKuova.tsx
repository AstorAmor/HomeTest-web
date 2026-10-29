import Inline from "./Inline";

// Un gráfico de Kuova Letter: ![texto alternativo](kg:id) en el texto del número. Aquí solo va el hueco
// con el nombre del gráfico y sus datos; lo pinta en el navegador kuova-graficos.js (GraficosKuova), el
// mismo código que hace la imagen del email, con sus controles, el tooltip y la tabla «Ver los datos».
export default function GraficoKuova({
  id,
  grafico,
  alt,
  caption,
}: {
  id: string;
  grafico?: { grafico: string; opciones: object };
  alt: string;
  caption: string;
}) {
  if (!grafico)
    return (
      <p className="my-6 rounded-lg border border-dashed border-border p-4 text-sm text-text-muted">
        Falta el gráfico «{id}» en content/conocimiento/kuova-letter/ (vuelve a importar el número con scripts/importar-numero.mjs).
      </p>
    );
  return (
    <figure className="my-9 min-w-0 rounded-2xl border border-border bg-bg px-3 pb-4 pt-5 sm:px-5">
      <div data-kg={grafico.grafico} data-kg-opciones={JSON.stringify(grafico.opciones)} aria-label={alt || undefined} />
      {caption && (
        <figcaption className="mt-3 text-sm leading-relaxed text-text-muted">
          <Inline text={caption} />
        </figcaption>
      )}
    </figure>
  );
}
