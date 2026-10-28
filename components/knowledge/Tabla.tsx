import Inline from "./Inline";

// Nombre de columna sin Markdown ni citas, para la etiqueta de cada dato en el móvil
const label = (s = "") => s.replace(/\[\^\w+\]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*/g, "").trim();

// Tabla de un texto largo (Markdown en las celdas). En el ordenador, una tabla normal. En el móvil
// cada fila es una tarjeta y cada dato lleva encima el nombre de su columna (data-label), para no
// tener que deslizar de lado. `activa` resalta una fila (la del tramo de la regla de cifras).
export default function Tabla({ head, rows, activa = null, className = "my-8" }: { head: string[]; rows: string[][]; activa?: number | null; className?: string }) {
  return (
    <div className={`${className} overflow-hidden rounded-xl border border-border`}>
      <table className="w-full border-collapse text-left text-[0.95rem] leading-snug">
        <thead className="hidden bg-bg-soft sm:table-header-group">
          <tr>
            {head.map((h, j) => (
              <th key={j} scope="col" className="border-b border-border px-4 py-3 font-semibold text-text">
                <Inline text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr
              key={r}
              className={`block border-b border-border px-4 py-4 transition-colors last:border-0 sm:table-row sm:p-0 ${activa === r ? "bg-gold/15" : ""}`}
            >
              {row.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="block pb-1 font-semibold text-text sm:table-cell sm:px-4 sm:py-3 sm:align-top sm:font-medium">
                    <Inline text={c} />
                  </th>
                ) : (
                  <td
                    key={j}
                    data-label={label(head[j])}
                    className="block pt-2 text-text/85 before:block before:text-xs before:font-semibold before:uppercase before:tracking-wide before:text-accent-light before:content-[attr(data-label)] sm:table-cell sm:px-4 sm:py-3 sm:align-top sm:before:hidden"
                  >
                    <Inline text={c} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
