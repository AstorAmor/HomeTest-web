import { plain } from "@/lib/knowledge";
import Inline from "./Inline";

// Tabla de rangos por grupo (p. ej. mujeres y hombres) con una barra por grupo. En el Markdown es
// una tabla normal con [[rangos]] en la línea de encima: la primera columna es la prueba; las demás,
// un rango por grupo escrito «12,1 a 15,1 g/dL», «Más de 1,2 mmol/L» o «Menos de 5 mmol/L»; y una
// última columna «Nota», si la hay, va debajo de la fila en pequeño. Las barras de una fila
// comparten escala, para ver de un vistazo cómo se solapan los grupos. Si una celda no se entiende,
// esa barra no se pinta (el texto sigue). Sin JavaScript: se pinta en el servidor.

// Bronce y verde de la marca, más saturados para que se distingan; comprobados con daltonismo
// (la separación es justa, por eso cada grupo lleva siempre su nombre o su cuadradito al lado)
const COLORES = ["#B5792A", "#1E7F5C"];

type Tramo = { desde: number | null; hasta: number | null };

const numero = (s: string) => Number(s.replace(",", "."));

function tramoDe(celda: string): Tramo | null {
  const t = plain(celda);
  let m = t.match(/^(?:de\s+|del\s+)?(\d+(?:,\d+)?)\s*(?:%\s*)?(?:a|al|–|-)\s*(\d+(?:,\d+)?)/i);
  if (m) return { desde: numero(m[1]), hasta: numero(m[2]) };
  if ((m = t.match(/^(?:más de|>)\s*(\d+(?:,\d+)?)/i))) return { desde: numero(m[1]), hasta: null };
  if ((m = t.match(/^(?:menos de|<)\s*(\d+(?:,\d+)?)/i))) return { desde: null, hasta: numero(m[1]) };
  return null;
}

// Escala de una fila: de un poco por debajo del valor más bajo a un poco por encima del más alto.
// Con un extremo abierto («más de»), la barra llega al borde y se difumina.
function escalaDe(tramos: (Tramo | null)[]) {
  const valores = tramos.flatMap((t) => (t ? [t.desde, t.hasta] : [])).filter((v): v is number => v !== null);
  if (!valores.length) return null;
  const lo = Math.min(...valores);
  const hi = Math.max(...valores);
  const abierto = tramos.some((t) => t && (t.desde === null || t.hasta === null));
  const margen = abierto ? Math.max(hi - lo, hi * 0.4) : (hi - lo) * 0.2 || hi * 0.1;
  const min = Math.max(0, lo - margen);
  const max = hi + margen;
  return (v: number) => ((v - min) / (max - min)) * 100;
}

export default function Rangos({ head, rows }: { head: string[]; rows: string[][] }) {
  const conNota = /^nota/i.test(plain(head[head.length - 1] ?? ""));
  const grupos = head.slice(1, conNota ? -1 : undefined);
  const etiqueta = (j: number) => plain(grupos[j] ?? "");

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-border">
      <table className="w-full border-collapse text-left text-[0.95rem] leading-snug">
        <thead className="hidden bg-bg-soft sm:table-header-group">
          <tr>
            <th scope="col" className="border-b border-border px-4 py-3 font-semibold text-text">
              <Inline text={head[0] ?? ""} />
            </th>
            {grupos.map((g, j) => (
              <th key={j} scope="col" className="border-b border-border px-4 py-3 font-semibold text-text">
                <span aria-hidden className="mr-2 inline-block h-2.5 w-2.5 rounded-[3px] align-middle" style={{ background: COLORES[j % COLORES.length] }} />
                <Inline text={g} />
              </th>
            ))}
          </tr>
        </thead>
        {rows.map((row, r) => {
          const celdas = row.slice(1, 1 + grupos.length);
          const tramos = celdas.map(tramoDe);
          const x = escalaDe(tramos);
          const nota = conNota ? row[row.length - 1] : "";
          return (
            <tbody key={r} className="border-b border-border last:border-0">
              <tr className="block px-4 pt-4 sm:table-row sm:p-0">
                <th scope="row" className="block pb-1 font-semibold text-text sm:table-cell sm:px-4 sm:pb-1 sm:pt-3 sm:align-top sm:font-medium">
                  <Inline text={row[0] ?? ""} />
                </th>
                {celdas.map((c, j) => (
                  <td
                    key={j}
                    data-label={etiqueta(j)}
                    className="block pt-2 tabular-nums text-text/85 before:block before:text-xs before:font-semibold before:uppercase before:tracking-wide before:text-accent-light before:content-[attr(data-label)] sm:table-cell sm:px-4 sm:pb-1 sm:pt-3 sm:align-top sm:before:hidden"
                  >
                    <span aria-hidden className="mr-2 inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: COLORES[j % COLORES.length] }} />
                    <Inline text={c} />
                  </td>
                ))}
              </tr>
              <tr className="block px-4 pb-4 pt-3 sm:table-row sm:p-0">
                <td className="hidden sm:table-cell" />
                <td colSpan={grupos.length} className="block sm:table-cell sm:px-4 sm:pb-4 sm:pt-1">
                  {x && (
                    // Las barras repiten lo que dice el texto de arriba: los lectores de pantalla se las saltan
                    <div aria-hidden className="space-y-1.5">
                      {tramos.map((t, j) => {
                        const color = COLORES[j % COLORES.length];
                        const a = t?.desde !== null && t?.desde !== undefined ? x(t.desde) : 0;
                        const b = t?.hasta !== null && t?.hasta !== undefined ? x(t.hasta) : 100;
                        const abierto = t ? (t.hasta === null ? "derecha" : t.desde === null ? "izquierda" : null) : null;
                        return (
                          <div key={j} className="relative h-2 rounded-[4px] bg-bg-soft">
                            {t && (
                              <div
                                className={`absolute inset-y-0 ${abierto === "derecha" ? "rounded-l-[4px]" : abierto === "izquierda" ? "rounded-r-[4px]" : "rounded-[4px]"}`}
                                style={{
                                  left: `${a}%`,
                                  width: `${b - a}%`,
                                  background: abierto
                                    ? `linear-gradient(to ${abierto === "derecha" ? "right" : "left"}, ${color} 55%, transparent)`
                                    : color,
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {nota && (
                    <p className="mt-3 text-sm leading-relaxed text-text-muted">
                      <Inline text={nota} />
                    </p>
                  )}
                </td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
