import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import { siteCopy } from "@/lib/content";

export default function ShareResults() {
  const { compartir_resultados } = siteCopy;

  return (
    <Section soft>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            title={compartir_resultados.titulo}
            subtitle={compartir_resultados.descripcion}
          />
          <ul className="mt-8 space-y-4">
            {compartir_resultados.puntos.map((punto) => (
              <li key={punto} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs text-accent-light">
                  ✓
                </span>
                <span className="text-text-muted">{punto}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ilustración simple decorativa: tarjeta de resultado + burbuja de chat */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-light">
              Tus resultados
            </p>
            <div className="mt-4 space-y-3">
              {["Vitamina D", "Hierro y ferritina", "TSH"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl bg-bg-soft px-4 py-3"
                >
                  <span className="text-sm text-text">{item}</span>
                  <span className="h-2 w-16 rounded-full bg-accent/40" />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 -right-4 max-w-[12rem] rounded-2xl border border-border bg-bg p-4 shadow-xl shadow-black/40 sm:-right-8">
            <p className="text-xs text-text-muted">
              &ldquo;Aquí tienes 3 preguntas para tu próxima cita médica&rdquo;
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
