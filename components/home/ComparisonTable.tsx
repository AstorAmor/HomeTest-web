import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import { getContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";

export default function ComparisonTable() {
  const { comparativa, ui } = getContent(getLang()).siteCopy;

  return (
    <Section>
      <SectionHeading
        title={comparativa.titulo_seccion}
        subtitle={comparativa.subtitulo_seccion}
      />

      <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="p-4 text-sm font-semibold text-text-muted">{ui.criterio}</th>
              <th className="p-4 text-sm font-semibold text-text-muted">
                {comparativa.columna_tradicional}
              </th>
              <th className="p-4 text-sm font-semibold text-accent-light">
                {comparativa.columna_nosotros}
              </th>
            </tr>
          </thead>
          <tbody>
            {comparativa.filas.map((fila, i) => (
              <tr
                key={fila.criterio}
                className={i % 2 === 0 ? "bg-bg" : "bg-bg-soft"}
              >
                <td className="p-4 text-sm font-medium text-text">{fila.criterio}</td>
                <td className="p-4 text-sm text-text-muted">{fila.tradicional}</td>
                <td className="p-4 text-sm text-text">{fila.nosotros}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
